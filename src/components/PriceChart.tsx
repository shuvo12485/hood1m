import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, ColorType } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { Token } from '../types';

interface PriceChartProps {
  token: Token;
}

type Timeframe = '1M' | '5M' | '15M' | '1H' | '1D';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ token }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('15M');
  const [displayMode, setDisplayMode] = useState<'price' | 'fdv'>('price');
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  // Timeframe resolutions in seconds
  const resolutionSeconds = useMemo(() => {
    switch (timeframe) {
      case '1M': return 60;
      case '5M': return 300;
      case '15M': return 900;
      case '1H': return 3600;
      case '1D': return 86400;
    }
  }, [timeframe]);

  // Generate realistic historical OHLC candles ending at the current token price
  const candles: CandleData[] = useMemo(() => {
    const numBars = 65;
    const nowSec = Math.floor(Date.now() / 1000);
    // Align time to current interval
    const currentIntervalTime = Math.floor(nowSec / resolutionSeconds) * resolutionSeconds;
    const startTime = currentIntervalTime - (numBars - 1) * resolutionSeconds;

    const data: CandleData[] = [];
    const targetPrice = token.price;
    const initialPrice = Math.max(0.001, targetPrice * 0.15); // Started lower on the curve

    let prevClose = initialPrice;

    for (let i = 0; i < numBars; i++) {
      const time = startTime + i * resolutionSeconds;
      const progress = i / (numBars - 1);
      
      // Expected trend toward target price
      const expectedPrice = initialPrice + (targetPrice - initialPrice) * Math.pow(progress, 1.2);
      const volatility = expectedPrice * (0.015 + Math.sin(i * 1.5) * 0.008);

      const open = i === 0 ? initialPrice : prevClose;
      const isUp = i === numBars - 1 ? targetPrice >= open : Math.sin(i * 2.3 + 1) > -0.15;
      
      const change = isUp ? Math.abs(volatility) : -Math.abs(volatility * 0.7);
      let close = i === numBars - 1 ? targetPrice : Math.max(0.0005, open + change);
      
      const high = Math.max(open, close) + Math.abs(volatility * 0.5);
      const low = Math.min(open, close) - Math.abs(volatility * 0.4);
      const volume = Math.floor(10000 + Math.random() * 85000 * (1 + progress * 2));

      prevClose = close;

      data.push({
        time,
        open,
        high,
        low,
        close,
        volume,
      });
    }

    return data;
  }, [token.price, resolutionSeconds]);

  // Initialize and update chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 360,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgb(112, 112, 104)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(16, 17, 15, 0.05)', style: 1 },
        horzLines: { color: 'rgba(16, 17, 15, 0.05)', style: 1 },
      },
      crosshair: {
        vertLine: { color: 'rgb(16, 17, 15)', width: 1, style: 2 },
        horzLine: { color: 'rgb(16, 17, 15)', width: 1, style: 2 },
      },
      timeScale: {
        borderColor: 'rgb(222, 220, 211)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgb(222, 220, 211)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2, // Leave space for volume histogram
        },
      },
    });

    // Up green matches Robinhood/Millionaires green #00C805 / #00995C
    const upColor = '#00C805';
    const downColor = '#D63434';

    // Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
      priceFormat: {
        type: 'price',
        precision: displayMode === 'fdv' ? 2 : 6,
        minMove: displayMode === 'fdv' ? 0.01 : 0.000001,
      },
    });

    // Add Volume Series at bottom
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: 'rgba(16, 17, 15, 0.12)',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Apply multiplier for FDV mode (1,000,000,000 supply)
    const multiplier = displayMode === 'fdv' ? 1_000_000_000 : 1;

    candleSeries.setData(
      candles.map(c => ({
        time: c.time as any,
        open: c.open * multiplier,
        high: c.high * multiplier,
        low: c.low * multiplier,
        close: c.close * multiplier,
      }))
    );

    volumeSeries.setData(
      candles.map(c => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(0, 200, 5, 0.22)' : 'rgba(214, 52, 52, 0.22)',
      }))
    );

    chart.timeScale().fitContent();

    // Subscribe to crosshair move for real OHLC inspection
    chart.subscribeCrosshairMove(param => {
      if (!param.time || !param.seriesData) {
        setHoveredCandle(null);
        return;
      }
      const data = param.seriesData.get(candleSeries) as any;
      if (data && typeof data.open === 'number') {
        const found = candles.find(c => c.time === (param.time as number));
        setHoveredCandle({
          time: param.time as number,
          open: data.open / multiplier,
          high: data.high / multiplier,
          low: data.low / multiplier,
          close: data.close / multiplier,
          volume: found?.volume || 0,
        });
      }
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle responsive container resize
    const handleResize = () => {
      if (container && chartRef.current) {
        chartRef.current.applyOptions({ width: container.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, displayMode]);

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  const formatPrice = (val: number) => {
    if (displayMode === 'fdv') {
      const fdvVal = val * 1_000_000_000;
      if (fdvVal >= 1_000_000) return `$${(fdvVal / 1_000_000).toFixed(2)}M`;
      if (fdvVal >= 1_000) return `$${(fdvVal / 1_000).toFixed(1)}K`;
      return `$${fdvVal.toFixed(2)}`;
    }
    return `$${val.toFixed(6)}`;
  };

  const formatDateTime = (sec: number) => {
    const d = new Date(sec * 1000);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="panel p-5">
      {/* Top Banner: Price, Change, Resolution buttons, FDV toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgb(var(--line))] pb-4">
        <div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-pixel text-3xl font-bold text-[rgb(var(--ink))]">
              {displayMode === 'fdv'
                ? `$${(token.fdv / 1_000_000).toFixed(2)}M`
                : `$${token.price.toFixed(6)}`}
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                token.change24h >= 0 ? 'text-[#00C805]' : 'text-[rgb(var(--down))]'
              }`}
            >
              {token.change24h >= 0 ? '+' : ''}
              {token.change24h.toFixed(1)}%
            </span>
          </div>
          <div className="font-mono text-xs text-[rgb(var(--muted))] mt-0.5">
            FDV: ${(token.fdv / 1_000_000).toFixed(2)}M · Reserve: {token.ethReserve.toFixed(2)} ETH (~${(token.ethReserve * 3100).toLocaleString()})
          </div>
        </div>

        {/* Controls: Mode & Timeframes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Price vs FDV Toggle */}
          <div className="flex rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--raised))]/50 p-0.5">
            <button
              onClick={() => setDisplayMode('price')}
              className={`rounded-md px-2.5 py-1 font-mono text-xs font-semibold transition ${
                displayMode === 'price'
                  ? 'bg-[rgb(var(--card))] text-[rgb(var(--ink))] shadow-xs'
                  : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--ink))]'
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setDisplayMode('fdv')}
              className={`rounded-md px-2.5 py-1 font-mono text-xs font-semibold transition ${
                displayMode === 'fdv'
                  ? 'bg-[rgb(var(--card))] text-[rgb(var(--ink))] shadow-xs'
                  : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--ink))]'
              }`}
            >
              FDV
            </button>
          </div>

          {/* Timeframes */}
          <div className="flex rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--raised))]/50 p-0.5">
            {(['1M', '5M', '15M', '1H', '1D'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`rounded-md px-2.5 py-1 font-mono text-xs font-semibold transition ${
                  timeframe === tf
                    ? 'bg-[rgb(var(--card))] text-[rgb(var(--ink))] shadow-xs'
                    : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--ink))]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Candle OHLC Readout Bar */}
      {activeCandle && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[rgb(var(--muted))]">
          <span>
            Time: <strong className="text-[rgb(var(--ink))]">{formatDateTime(activeCandle.time)}</strong>
          </span>
          <span>
            O: <strong className="text-[rgb(var(--ink))]">{formatPrice(activeCandle.open)}</strong>
          </span>
          <span>
            H: <strong className="text-[#00C805]">{formatPrice(activeCandle.high)}</strong>
          </span>
          <span>
            L: <strong className="text-[rgb(var(--down))]">{formatPrice(activeCandle.low)}</strong>
          </span>
          <span>
            C: <strong className="text-[rgb(var(--ink))]">{formatPrice(activeCandle.close)}</strong>
          </span>
          <span>
            Vol: <strong className="text-[rgb(var(--ink))]">${(activeCandle.volume).toLocaleString()}</strong>
          </span>
        </div>
      )}

      {/* Real TradingView Lightweight Chart Container */}
      <div className="relative mt-2 w-full">
        <div ref={chartContainerRef} className="h-[360px] w-full" />
      </div>
    </div>
  );
};
