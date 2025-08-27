// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { models, Report } from 'powerbi-client';
import { OptimizedPowerBIConfig } from '../../utils/optimized-powerbi-config';
import { useReportLoadManager } from '../../utils/report-load-manager';
import { usePowerBIService } from '../../hooks/usePowerBIService';
import './OptimizedPowerBIEmbed.css';

interface OptimizedPowerBIEmbedProps {
    reportId: string;
    embedUrl: string;
    accessToken: string;
    className?: string;
    onLoaded?: (report: Report) => void;
    onError?: (error: any) => void;
    onDataSelected?: (event: any) => void;
    options?: {
        enableExport?: boolean;
        enablePrint?: boolean;
        enableFullscreen?: boolean;
        hideFilters?: boolean;
        hidePageNavigation?: boolean;
    };
    // Nouvelles props pour améliorer l'expérience
    showLoadingState?: boolean;
    errorFallback?: React.ReactNode;
    height?: string | number;
    // Optimisations pour multiple rapports
    priority?: 'high' | 'normal' | 'low';
    lazyLoad?: boolean;
    maxConcurrentLoads?: number;
    resourceOptimization?: {
        disableAnimations?: boolean;
        reduceQuality?: boolean;
        limitRefreshRate?: boolean;
    };
}

export const OptimizedPowerBIEmbed: React.FC<OptimizedPowerBIEmbedProps> = ({
    reportId,
    embedUrl,
    accessToken,
    className = 'optimized-powerbi-embed',
    onLoaded,
    onError,
    onDataSelected,
    options = {},
    showLoadingState = true,
    errorFallback,
    height = '500px',
    priority = 'normal',
    lazyLoad = false,
    maxConcurrentLoads = 3,
    resourceOptimization = {}
}) => {
    const reportRef = useRef<Report | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(!lazyLoad);
    const [shouldLoad, setShouldLoad] = useState(priority === 'high' || !lazyLoad);
    const loadManagerRef = useRef(useReportLoadManager());
    
    // Utilisation du service singleton Power BI
    const { embedReport, removeInstance, isInitialized } = usePowerBIService({
        autoCleanup: false // On gère le cleanup manuellement
    });
    
    // ID unique pour ce composant
    const componentId = useMemo(() => 
        `optimized-powerbi-${reportId}-${Date.now()}`, 
        [reportId]
    );
    
    // Configuration du gestionnaire de charge
    useEffect(() => {
        loadManagerRef.current.setMaxConcurrent(maxConcurrentLoads);
    }, [maxConcurrentLoads]);
    
    // IntersectionObserver pour le lazy loading
    useEffect(() => {
        if (!lazyLoad || shouldLoad) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        // Utiliser le gestionnaire de charge global
                        loadManagerRef.current.requestLoad(reportId, priority, () => {
                            setShouldLoad(true);
                        });
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' }
        );
        
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        
        return () => observer.disconnect();
    }, [lazyLoad, shouldLoad, reportId, priority]);
    
    // Configuration memorized pour éviter les re-renders inutiles
    const embedConfig = useMemo(() => {
        if (!shouldLoad) return null;
        
        const optimizedOptions = {
            ...options,
            // Optimisations pour multiples rapports
            ...(resourceOptimization.disableAnimations && { enableAnimations: false }),
            ...(resourceOptimization.reduceQuality && { 
                renderingMode: 'optimized',
                quality: 'medium'
            }),
            ...(resourceOptimization.limitRefreshRate && { 
                refreshRateLimit: priority === 'low' ? 30000 : 10000 
            })
        };
        
        return OptimizedPowerBIConfig.createOptimizedConfig(
            reportId,
            embedUrl,
            accessToken,
            optimizedOptions
        );
    }, [reportId, embedUrl, accessToken, shouldLoad, JSON.stringify(options), JSON.stringify(resourceOptimization), priority]);

    // Fonction d'embedding avec le service singleton
    const embedReportInContainer = useCallback(async () => {
        if (!containerRef.current || !embedConfig || !isInitialized) {
            return;
        }

        try {
            setIsLoading(true);
            setHasError(null);

            const report = await embedReport(
                containerRef.current,
                embedConfig,
                componentId
            );

            reportRef.current = report;

            // Configuration des event listeners
            report.on('loaded', () => {
                console.log(`✅ Report ${reportId} loaded successfully`);
                setIsLoading(false);
                setHasError(null);
                loadManagerRef.current.reportLoaded(reportId);
                if (onLoaded) {
                    onLoaded(report);
                }
            });

            report.on('error', (event: any) => {
                console.error(`❌ Report ${reportId} error:`, event.detail);
                setIsLoading(false);
                setHasError(event.detail?.message || 'Report loading failed');
                loadManagerRef.current.reportFailed(reportId);
                if (onError) {
                    onError(event.detail);
                }
            });

            report.on('dataSelected', (event: any) => {
                if (onDataSelected) {
                    onDataSelected(event.detail);
                }
            });

            report.on('rendered', () => {
                console.log(`🎨 Report ${reportId} rendered`);
            });

            console.log(`🔗 Report ${reportId} embedded with singleton service`);

        } catch (error) {
            console.error(`❌ Failed to embed report ${reportId}:`, error);
            setIsLoading(false);
            setHasError(error instanceof Error ? error.message : 'Embedding failed');
            loadManagerRef.current.reportFailed(reportId);
        }
    }, [embedConfig, isInitialized, embedReport, componentId, reportId, onLoaded, onError, onDataSelected]);

    // Déclencher l'embedding quand shouldLoad devient true
    useEffect(() => {
        if (shouldLoad && embedConfig && isInitialized) {
            embedReportInContainer();
        }
    }, [shouldLoad, embedConfig, isInitialized, embedReportInContainer]);

    // Event handlers optimisés - maintenant gérés dans embedReportInContainer
    const handleLoaded = useCallback(() => {
        // Cette fonction est maintenant intégrée dans embedReportInContainer
    }, []);

    const handleError = useCallback(() => {
        // Cette fonction est maintenant intégrée dans embedReportInContainer  
    }, []);

    const handleDataSelected = useCallback(() => {
        // Cette fonction est maintenant intégrée dans embedReportInContainer
    }, []);

    const handleRendered = useCallback(() => {
        // Cette fonction est maintenant intégrée dans embedReportInContainer
    }, []);

    const handleSaved = useCallback(() => {
        // Cette fonction est maintenant intégrée dans embedReportInContainer
    }, []);

    // eventHandlers n'est plus nécessaire avec le service singleton
    const eventHandlers = useMemo(() => new Map(), []);

    // Cleanup automatique
    useEffect(() => {
        return () => {
            // Annuler le chargement si le composant est démonté
            loadManagerRef.current.cancelLoad(reportId);
            
            // Supprimer l'instance du service singleton
            removeInstance(componentId);
            
            console.log(`🧹 Cleaned up report ${reportId} from singleton service`);
        };
    }, [reportId, componentId, removeInstance]);

    const handleGetEmbedded = useCallback(() => {
        // Cette fonction n'est plus nécessaire avec le service singleton
        // L'embedding est géré directement par embedReportInContainer
        console.log(`🔗 Got embedded component for report ${reportId}`);
    }, [reportId]);

    // Retry function en cas d'erreur
    const handleRetry = useCallback(() => {
        setHasError(null);
        setIsLoading(true);
        // Utiliser le gestionnaire pour relancer le chargement
        loadManagerRef.current.requestLoad(reportId, priority, () => {
            setShouldLoad(true);
        });
    }, [reportId, priority]);

    // Si le composant ne devrait pas encore charger (lazy loading)
    if (!shouldLoad) {
        return (
            <div 
                ref={containerRef}
                className={`${className} optimized-container lazy-loading`} 
                style={{ height }}
            >
                <div className="lazy-placeholder">
                    <div className="lazy-icon">📊</div>
                    <p>Rapport en attente de chargement...</p>
                    {priority === 'low' && (
                        <small>Priorité basse - chargera automatiquement</small>
                    )}
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className={`${className} optimized-container error-state`} style={{ height }}>
                {errorFallback || (
                    <div className="error-content">
                        <div className="error-icon">⚠️</div>
                        <h4>Erreur de chargement du rapport</h4>
                        <p>{hasError}</p>
                        <button onClick={handleRetry} className="retry-button">
                            🔄 Réessayer
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            className={`${className} optimized-container`} 
            style={{ height }}
        >
            {showLoadingState && isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Chargement du rapport...</p>
                    {priority === 'low' && (
                        <small>Priorité basse</small>
                    )}
                    <small>Service singleton actif</small>
                </div>
            )}
            
            {/* Le contenu PowerBI sera injecté directement dans ce container par le service singleton */}
        </div>
    );
};
