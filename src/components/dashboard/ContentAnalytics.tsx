"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Eye, Heart, Download, Share, Palette, Star } from 'lucide-react';

interface ContentMetrics {
  id: string;
  imageUrl: string;
  generatedText: string;
  views: number;
  likes: number;
  downloads: number;
  shares: number;
  brandScore: number; // 0-100 based on color consistency, style match
  engagementRate: number;
  createdAt: string;
  intent: 'sleep' | 'focus' | 'recovery';
}

interface AnalyticsProps {
  userId: string;
  projectId?: string;
}

const SOMA_COLORS = {
  petroleo: '#015965',
  pino: '#006D5A', 
  aquamarina: '#2FFFCC',
  lavanda: '#D4C4FC',
  negro: '#051F22',
  blanco: '#F7FBFE'
};

export default function ContentAnalytics({ userId, projectId }: AnalyticsProps) {
  const [metrics, setMetrics] = useState<ContentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Brand consistency scoring
  const calculateBrandScore = (imageData: string, generatedText: string): number => {
    let score = 0;
    
    // Text analysis for brand voice
    const brandKeywords = ['rendimiento', 'recuperación', 'tecnología', 'bienestar', 'equilibrio'];
    const wordCount = brandKeywords.filter(keyword => 
      generatedText.toLowerCase().includes(keyword)
    ).length;
    score += (wordCount / brandKeywords.length) * 40;
    
    // Style consistency (would need actual image analysis)
    score += 35; // Placeholder for color palette analysis
    
    // Intent alignment
    score += 25; // Placeholder for intent-message alignment
    
    return Math.min(100, Math.round(score));
  };

  const getTopPerformingContent = () => {
    return metrics
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 5);
  };

  const getBrandScoreAverage = () => {
    if (metrics.length === 0) return 0;
    return Math.round(
      metrics.reduce((sum, metric) => sum + metric.brandScore, 0) / metrics.length
    );
  };

  const getIntentPerformance = () => {
    const intentGroups = metrics.reduce((acc, metric) => {
      if (!acc[metric.intent]) acc[metric.intent] = [];
      acc[metric.intent].push(metric);
      return acc;
    }, {} as Record<string, ContentMetrics[]>);

    return Object.entries(intentGroups).map(([intent, contentList]) => ({
      intent,
      avgEngagement: contentList.reduce((sum, c) => sum + c.engagementRate, 0) / contentList.length,
      avgBrandScore: contentList.reduce((sum, c) => sum + c.brandScore, 0) / contentList.length,
      count: contentList.length
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold" style={{ 
          color: '#F7FBFE',
          fontFamily: 'Saira, sans-serif' 
        }}>
          Análisis de Contenido
        </h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              style={{ 
                backgroundColor: timeRange === range ? '#015965' : 'transparent',
                color: timeRange === range ? '#F7FBFE' : '#2FFFCC'
              }}
            >
              {range === '7d' ? '7 días' : range === '30d' ? '30 días' : '90 días'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-2" style={{ 
          backgroundColor: 'rgba(0, 109, 90, 0.1)',
          borderColor: 'rgba(0, 109, 90, 0.3)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(47, 255, 204, 0.2)' }}>
              <TrendingUp className="h-5 w-5" style={{ color: '#2FFFCC' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#F7FBFE' }}>
                {metrics.length}
              </div>
              <div className="text-sm" style={{ color: '#2FFFCC' }}>
                Contenidos Generados
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2" style={{ 
          backgroundColor: 'rgba(0, 109, 90, 0.1)',
          borderColor: 'rgba(0, 109, 90, 0.3)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(47, 255, 204, 0.2)' }}>
              <Palette className="h-5 w-5" style={{ color: '#2FFFCC' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#F7FBFE' }}>
                {getBrandScoreAverage()}%
              </div>
              <div className="text-sm" style={{ color: '#2FFFCC' }}>
                Consistencia de Marca
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2" style={{ 
          backgroundColor: 'rgba(0, 109, 90, 0.1)',
          borderColor: 'rgba(0, 109, 90, 0.3)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(47, 255, 204, 0.2)' }}>
              <Heart className="h-5 w-5" style={{ color: '#2FFFCC' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#F7FBFE' }}>
                {Math.round(metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length || 0)}%
              </div>
              <div className="text-sm" style={{ color: '#2FFFCC' }}>
                Engagement Promedio
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2" style={{ 
          backgroundColor: 'rgba(0, 109, 90, 0.1)',
          borderColor: 'rgba(0, 109, 90, 0.3)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(47, 255, 204, 0.2)' }}>
              <Download className="h-5 w-5" style={{ color: '#2FFFCC' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#F7FBFE' }}>
                {metrics.reduce((sum, m) => sum + m.downloads, 0)}
              </div>
              <div className="text-sm" style={{ color: '#2FFFCC' }}>
                Total Descargas
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Intent Performance Analysis */}
      <Card className="p-6 border-2" style={{ 
        backgroundColor: 'rgba(0, 109, 90, 0.1)',
        borderColor: 'rgba(0, 109, 90, 0.3)'
      }}>
        <h3 className="text-xl font-semibold mb-4" style={{ 
          color: '#F7FBFE',
          fontFamily: 'Saira, sans-serif' 
        }}>
          Rendimiento por Intención
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getIntentPerformance().map((intent) => (
            <div key={intent.intent} className="p-4 rounded-lg border" style={{ 
              backgroundColor: 'rgba(1, 89, 101, 0.2)',
              borderColor: 'rgba(1, 89, 101, 0.4)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize" style={{ 
                  color: '#2FFFCC',
                  fontFamily: 'Saira, sans-serif'
                }}>
                  {intent.intent}
                </h4>
                <span className="text-xs px-2 py-1 rounded-full" style={{ 
                  backgroundColor: 'rgba(47, 255, 204, 0.2)',
                  color: '#2FFFCC'
                }}>
                  {intent.count} posts
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#F7FBFE' }}>Engagement:</span>
                  <span style={{ color: '#2FFFCC' }}>{Math.round(intent.avgEngagement)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#F7FBFE' }}>Brand Score:</span>
                  <span style={{ color: '#2FFFCC' }}>{Math.round(intent.avgBrandScore)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Performing Content */}
      <Card className="p-6 border-2" style={{ 
        backgroundColor: 'rgba(0, 109, 90, 0.1)',
        borderColor: 'rgba(0, 109, 90, 0.3)'
      }}>
        <h3 className="text-xl font-semibold mb-4" style={{ 
          color: '#F7FBFE',
          fontFamily: 'Saira, sans-serif' 
        }}>
          Contenido Top Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getTopPerformingContent().map((content) => (
            <div key={content.id} className="border rounded-lg overflow-hidden" style={{ 
              backgroundColor: 'rgba(1, 89, 101, 0.2)',
              borderColor: 'rgba(1, 89, 101, 0.4)'
            }}>
              <div className="aspect-square bg-gray-200">
                <img 
                  src={content.imageUrl} 
                  alt="Generated content"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" style={{ color: '#2FFFCC' }} />
                    <span className="text-sm font-medium" style={{ color: '#2FFFCC' }}>
                      {content.brandScore}% Brand
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded" style={{ 
                    backgroundColor: 'rgba(47, 255, 204, 0.2)',
                    color: '#2FFFCC'
                  }}>
                    {content.engagementRate}% engagement
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ 
                  color: '#F7FBFE',
                  fontFamily: 'Manrope, sans-serif'
                }}>
                  {content.generatedText.substring(0, 80)}...
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: '#2FFFCC' }}>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {content.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {content.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {content.downloads}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 