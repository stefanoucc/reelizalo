"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Copy, 
  Trash2, 
  Filter, 
  Grid, 
  List,
  ChevronDown,
  Check,
  X,
  Eye,
  Edit,
  Star,
  Heart,
  Archive
} from 'lucide-react';

interface ImageData {
  id: string;
  url: string;
  prompt: string;
  layout: string;
  intent?: 'sleep' | 'focus' | 'recovery';
  createdAt: string;
  isFavorite: boolean;
  isArchived: boolean;
  brandScore?: number;
  engagementRate?: number;
  downloadCount?: number;
  tags: string[];
}

interface EnhancedImageGalleryProps {
  images: ImageData[];
  onImageEdit: (imageUrl: string) => void;
  onImageDelete: (imageId: string) => void;
  onBatchDownload: (imageIds: string[]) => void;
  onToggleFavorite: (imageId: string) => void;
  onToggleArchive: (imageId: string) => void;
}

const FILTER_OPTIONS = [
  { label: 'Todos', value: 'all' },
  { label: 'Favoritos', value: 'favorites' },
  { label: 'Sleep', value: 'sleep' },
  { label: 'Focus', value: 'focus' },
  { label: 'Recovery', value: 'recovery' },
  { label: 'Archivados', value: 'archived' }
];

const SORT_OPTIONS = [
  { label: 'Más recientes', value: 'newest' },
  { label: 'Más antiguos', value: 'oldest' },
  { label: 'Mayor engagement', value: 'engagement' },
  { label: 'Mejor brand score', value: 'brandScore' },
  { label: 'Más descargados', value: 'downloads' }
];

export default function EnhancedImageGallery({
  images,
  onImageEdit,
  onImageDelete,
  onBatchDownload,
  onToggleFavorite,
  onToggleArchive
}: EnhancedImageGalleryProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort images
  const filteredAndSortedImages = React.useMemo(() => {
    let filtered = images;

    // Apply filters
    switch (filterBy) {
      case 'favorites':
        filtered = filtered.filter(img => img.isFavorite);
        break;
      case 'sleep':
      case 'focus':
      case 'recovery':
        filtered = filtered.filter(img => img.intent === filterBy);
        break;
      case 'archived':
        filtered = filtered.filter(img => img.isArchived);
        break;
      default:
        filtered = filtered.filter(img => !img.isArchived);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'engagement':
        filtered.sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));
        break;
      case 'brandScore':
        filtered.sort((a, b) => (b.brandScore || 0) - (a.brandScore || 0));
        break;
      case 'downloads':
        filtered.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [images, filterBy, sortBy, searchTerm]);

  const handleSelectAll = () => {
    if (selectedImages.length === filteredAndSortedImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredAndSortedImages.map(img => img.id));
    }
  };

  const handleBatchAction = (action: 'download' | 'delete' | 'favorite' | 'archive') => {
    switch (action) {
      case 'download':
        onBatchDownload(selectedImages);
        break;
      case 'delete':
        selectedImages.forEach(id => onImageDelete(id));
        setSelectedImages([]);
        break;
      case 'favorite':
        selectedImages.forEach(id => onToggleFavorite(id));
        setSelectedImages([]);
        break;
      case 'archive':
        selectedImages.forEach(id => onToggleArchive(id));
        setSelectedImages([]);
        break;
    }
  };

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case 'sleep': return '#015965';
      case 'focus': return '#006D5A';
      case 'recovery': return '#2FFFCC';
      default: return '#051F22';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold" style={{ 
            color: '#F7FBFE',
            fontFamily: 'Saira, sans-serif' 
          }}>
            Galería de Imágenes ({filteredAndSortedImages.length})
          </h2>
          
          {selectedImages.length > 0 && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              {selectedImages.length} seleccionadas
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg" style={{ borderColor: '#015965' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-8 px-3 ${viewMode === 'grid' ? 'bg-[#015965]' : ''}`}
              style={{ color: '#2FFFCC' }}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`h-8 px-3 ${viewMode === 'list' ? 'bg-[#015965]' : ''}`}
              style={{ color: '#2FFFCC' }}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-8 px-3"
            style={{ color: '#2FFFCC', borderColor: '#015965', border: '1px solid' }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Buscar por prompt o tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-4 pr-10 border-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              backgroundColor: 'rgba(5, 31, 34, 0.5)', 
              borderColor: '#015965', 
              color: '#F7FBFE' 
            }}
          />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border rounded-lg p-4 space-y-4" style={{ 
            backgroundColor: 'rgba(0, 109, 90, 0.1)',
            borderColor: 'rgba(0, 109, 90, 0.3)'
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filter Options */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F7FBFE' }}>
                  Filtrar por:
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      variant={filterBy === option.value ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterBy(option.value)}
                      style={{ 
                        backgroundColor: filterBy === option.value ? '#015965' : 'transparent',
                        color: filterBy === option.value ? '#F7FBFE' : '#2FFFCC'
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F7FBFE' }}>
                  Ordenar por:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    backgroundColor: 'rgba(5, 31, 34, 0.5)', 
                    borderColor: '#015965', 
                    color: '#F7FBFE' 
                  }}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Batch Actions */}
      {selectedImages.length > 0 && (
        <div className="flex items-center gap-2 p-4 border rounded-lg" style={{ 
          backgroundColor: 'rgba(1, 89, 101, 0.2)',
          borderColor: 'rgba(1, 89, 101, 0.4)'
        }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBatchAction('download')}
            style={{ color: '#2FFFCC' }}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar ({selectedImages.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBatchAction('favorite')}
            style={{ color: '#2FFFCC' }}
          >
            <Heart className="h-4 w-4 mr-2" />
            Favoritar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBatchAction('archive')}
            style={{ color: '#2FFFCC' }}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archivar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBatchAction('delete')}
            style={{ color: '#ff6b6b' }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImages([])}
              style={{ color: '#2FFFCC' }}
            >
              <X className="h-4 w-4 mr-2" />
              Deseleccionar todo
            </Button>
          </div>
        </div>
      )}

      {/* Select All */}
      {filteredAndSortedImages.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedImages.length === filteredAndSortedImages.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm" style={{ color: '#F7FBFE' }}>
            Seleccionar todo
          </span>
        </div>
      )}

      {/* Image Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
        : "space-y-4"
      }>
        {filteredAndSortedImages.map((image) => (
          <div 
            key={image.id} 
            className={`group relative border-2 rounded-lg overflow-hidden transition-all hover:shadow-lg ${
              selectedImages.includes(image.id) ? 'ring-2 ring-blue-500' : ''
            } ${viewMode === 'list' ? 'flex items-center p-4' : ''}`}
            style={{ 
              backgroundColor: 'rgba(0, 109, 90, 0.1)',
              borderColor: selectedImages.includes(image.id) ? '#2FFFCC' : 'rgba(0, 109, 90, 0.3)'
            }}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
                           <Checkbox
               checked={selectedImages.includes(image.id)}
               onCheckedChange={(checked: boolean) => {
                 if (checked) {
                   setSelectedImages([...selectedImages, image.id]);
                 } else {
                   setSelectedImages(selectedImages.filter(id => id !== image.id));
                 }
               }}
              />
            </div>

            {/* Image */}
            <div className={`${viewMode === 'grid' ? 'aspect-square' : 'w-24 h-24 flex-shrink-0'} relative bg-gray-200 rounded`}>
              <Image 
                src={image.url} 
                alt={image.prompt} 
                fill
                className="object-cover"
              />
              
              {/* Favorite & Archive badges */}
              <div className="absolute top-2 right-2 flex gap-1">
                {image.isFavorite && (
                  <div className="w-6 h-6 rounded-full bg-yellow-500/80 flex items-center justify-center">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                )}
                {image.isArchived && (
                  <div className="w-6 h-6 rounded-full bg-gray-500/80 flex items-center justify-center">
                    <Archive className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className={`${viewMode === 'grid' ? 'p-3' : 'flex-1 ml-4'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {image.intent && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${getIntentColor(image.intent)}20`,
                        color: getIntentColor(image.intent),
                        border: `1px solid ${getIntentColor(image.intent)}40`
                      }}
                    >
                      {image.intent}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs" style={{ color: '#2FFFCC', borderColor: '#2FFFCC' }}>
                    {image.layout}
                  </Badge>
                </div>
                
                {(image.brandScore || image.engagementRate) && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#2FFFCC' }}>
                    {image.brandScore && <span>Brand: {image.brandScore}%</span>}
                    {image.engagementRate && <span>Eng: {image.engagementRate}%</span>}
                  </div>
                )}
              </div>

              <p className="text-sm mb-3 line-clamp-2" style={{ 
                color: '#F7FBFE',
                fontFamily: 'Manrope, sans-serif'
              }}>
                {image.prompt}
              </p>

              {/* Tags */}
              {image.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {image.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: 'rgba(47, 255, 204, 0.2)',
                        color: '#2FFFCC'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {image.tags.length > 3 && (
                    <span className="text-xs" style={{ color: '#2FFFCC' }}>
                      +{image.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onImageEdit(image.url)}
                    className="h-8 w-8 p-0"
                    style={{ color: '#2FFFCC' }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleFavorite(image.id)}
                    className="h-8 w-8 p-0"
                    style={{ color: image.isFavorite ? '#FFD700' : '#2FFFCC' }}
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                  <a
                    href={image.url}
                    download={`soma_${image.layout}_${image.id}.png`}
                    className="inline-flex items-center justify-center h-8 w-8 p-0 hover:bg-opacity-20 rounded"
                    style={{ color: '#2FFFCC' }}
                  >
                    <Download className="h-3 w-3" />
                  </a>
                </div>
                
                <div className="text-xs" style={{ color: '#2FFFCC' }}>
                  {new Date(image.createdAt).toLocaleDateString()}
                  {image.downloadCount && <span> • {image.downloadCount} descargas</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedImages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ color: '#015965' }}>🎨</div>
          <h3 className="text-xl font-semibold mb-2" style={{ 
            color: '#F7FBFE',
            fontFamily: 'Saira, sans-serif' 
          }}>
            No se encontraron imágenes
          </h3>
          <p className="text-sm" style={{ 
            color: '#2FFFCC',
            fontFamily: 'Manrope, sans-serif'
          }}>
            {searchTerm || filterBy !== 'all' 
              ? 'Prueba con otros filtros o términos de búsqueda'
              : 'Genera tus primeras imágenes para comenzar'
            }
          </p>
        </div>
      )}
    </div>
  );
} 