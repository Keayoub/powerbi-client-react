// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useRef, useState } from 'react';
import { service, factories, models, Report } from 'powerbi-client';

interface SimplePowerBIEmbedProps {
    reportId: string;
    embedUrl: string;
    accessToken: string;
    className?: string;
    onLoaded?: (report: Report) => void;
    onError?: (error: any) => void;
    height?: string | number;
}

export const SimplePowerBIEmbed: React.FC<SimplePowerBIEmbedProps> = ({
    reportId,
    embedUrl,
    accessToken,
    className = 'simple-powerbi-embed',
    onLoaded,
    onError,
    height = '500px'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState<string | null>(null);
    const reportRef = useRef<Report | null>(null);
    const serviceRef = useRef<service.Service | null>(null);

    useEffect(() => {
        if (!containerRef.current || !accessToken || !embedUrl || !reportId) {
            console.warn('❌ Missing required props for PowerBI embed');
            return;
        }

        // Initialiser le service PowerBI
        if (!serviceRef.current) {
            serviceRef.current = new service.Service(
                factories.hpmFactory,
                factories.wpmpFactory,
                factories.routerFactory
            );
        }

        const embedReport = async () => {
            try {
                setIsLoading(true);
                setHasError(null);

                // Configuration d'embedding simplifiée
                const config: models.IReportEmbedConfiguration = {
                    type: 'report',
                    id: reportId,
                    embedUrl: embedUrl,
                    accessToken: accessToken,
                    tokenType: models.TokenType.Embed,
                    settings: {
                        panes: {
                            filters: {
                                expanded: false,
                                visible: true
                            },
                            pageNavigation: {
                                visible: true
                            }
                        },
                        background: models.BackgroundType.Transparent
                    }
                };

                console.log('🔗 Embedding PowerBI report with config:', {
                    reportId,
                    embedUrl: embedUrl.substring(0, 50) + '...',
                    hasToken: !!accessToken
                });

                // Embed le rapport
                const report = serviceRef.current!.embed(
                    containerRef.current!,
                    config
                ) as Report;

                reportRef.current = report;

                // Gérer les événements
                report.on('loaded', () => {
                    console.log('✅ Report loaded successfully');
                    setIsLoading(false);
                    setHasError(null);
                    if (onLoaded) {
                        onLoaded(report);
                    }
                });

                report.on('error', (event: any) => {
                    console.error('❌ Report error:', event.detail);
                    setIsLoading(false);
                    setHasError(event.detail?.message || 'Report loading failed');
                    if (onError) {
                        onError(event.detail);
                    }
                });

                report.on('rendered', () => {
                    console.log('🎨 Report rendered');
                });

            } catch (error) {
                console.error('❌ Failed to embed report:', error);
                setIsLoading(false);
                setHasError(error instanceof Error ? error.message : 'Embedding failed');
                if (onError) {
                    onError(error);
                }
            }
        };

        embedReport();

        // Cleanup
        return () => {
            if (reportRef.current) {
                try {
                    reportRef.current.off('loaded');
                    reportRef.current.off('error');
                    reportRef.current.off('rendered');
                } catch (error) {
                    console.warn('⚠️ Error during cleanup:', error);
                }
            }
        };
    }, [reportId, embedUrl, accessToken, onLoaded, onError]);

    if (hasError) {
        return (
            <div 
                className={`${className} error-state`} 
                style={{ 
                    height, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    border: '2px solid #ff6b6b',
                    borderRadius: '8px',
                    backgroundColor: '#ffe0e0',
                    padding: '20px'
                }}
            >
                <div style={{ color: '#d63031', textAlign: 'center' }}>
                    <h4>⚠️ Erreur de chargement</h4>
                    <p>{hasError}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#d63031',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Recharger la page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={className}
            style={{ 
                position: 'relative', 
                width: '100%', 
                height, 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                overflow: 'hidden'
            }}
        >
            {isLoading && (
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                >
                    <div 
                        style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #007acc',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}
                    />
                    <p style={{ marginTop: '16px', color: '#666' }}>
                        Chargement du rapport PowerBI...
                    </p>
                </div>
            )}
            
            <div 
                ref={containerRef}
                style={{ 
                    width: '100%', 
                    height: '100%' 
                }}
            />

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
