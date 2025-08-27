/**
 * Exemple d'utilisation avec configuration du logging optionnel
 * Montre comment désactiver les logs en production
 */

import React, { useState } from 'react';
import { PowerBIServiceProvider } from '../PowerBIServiceProvider';
import { OptimizedPowerBIEmbed } from '../optimized-powerbi/OptimizedPowerBIEmbed';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { usePowerBIService } from '../../hooks/usePowerBIService';

// Configuration d'environnement
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export const LoggingConfigExample: React.FC = () => {
    const [loggingEnabled, setLoggingEnabled] = useState(!isProduction);
    const [performanceTrackingEnabled, setPerformanceTrackingEnabled] = useState(true);
    
    // Token d'accès (à remplacer par votre token réel)
    const accessToken = "YOUR_POWERBI_ACCESS_TOKEN";

    // Configuration avec logging optionnel
    const serviceConfig = {
        accessToken,
        enableLogging: loggingEnabled,
        enablePerformanceTracking: performanceTrackingEnabled
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>🔧 Configuration du Logging Power BI</h1>
            
            {/* Panneau de configuration */}
            <div style={{
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '30px'
            }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#495057' }}>
                    ⚙️ Configuration des Options
                </h3>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {/* Configuration du Logging */}
                    <div style={{
                        background: 'white',
                        padding: '15px',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6'
                    }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>
                            📝 Logging
                        </h4>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={loggingEnabled}
                                    onChange={(e) => setLoggingEnabled(e.target.checked)}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                                <span>Activer le logging</span>
                            </label>
                        </div>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                            <strong>Statut actuel:</strong> {loggingEnabled ? '✅ Activé' : '❌ Désactivé'}
                            <br />
                            <strong>Environnement:</strong> {isProduction ? '🏭 Production' : '🔧 Développement'}
                            <br />
                            <strong>Recommandation:</strong> {isProduction ? 'Désactivé en production' : 'Activé en développement'}
                        </div>
                    </div>

                    {/* Configuration du Performance Tracking */}
                    <div style={{
                        background: 'white',
                        padding: '15px',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6'
                    }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>
                            📊 Performance Tracking
                        </h4>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={performanceTrackingEnabled}
                                    onChange={(e) => setPerformanceTrackingEnabled(e.target.checked)}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                                <span>Activer le tracking des performances</span>
                            </label>
                        </div>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                            <strong>Statut actuel:</strong> {performanceTrackingEnabled ? '✅ Activé' : '❌ Désactivé'}
                            <br />
                            <strong>Impact:</strong> {performanceTrackingEnabled ? 'Métriques TTFMP/TTI disponibles' : 'Pas de métriques'}
                            <br />
                            <strong>Recommandation:</strong> Activé pour monitoring
                        </div>
                    </div>
                </div>

                {/* Informations d'environnement */}
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: isDevelopment ? '#d4edda' : '#fff3cd',
                    border: '1px solid ' + (isDevelopment ? '#c3e6cb' : '#ffeaa7'),
                    borderRadius: '6px'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                        🌍 Configuration d'Environnement
                    </h4>
                    <div style={{ fontSize: '0.9em' }}>
                        <strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'non défini'}
                        <br />
                        <strong>Configuration automatique:</strong>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                            <li><strong>Production:</strong> Logging désactivé par défaut pour les performances</li>
                            <li><strong>Développement:</strong> Logging activé pour le debug</li>
                            <li><strong>Performance tracking:</strong> Toujours recommandé pour le monitoring</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Exemple avec service configuré */}
            <PowerBIServiceProvider
                accessToken={accessToken}
                autoTokenRefresh={true}
                tokenRefreshInterval={50}
                enableLogging={loggingEnabled}
                enablePerformanceTracking={performanceTrackingEnabled}
            >
                <LoggingExampleContent />
            </PowerBIServiceProvider>
        </div>
    );
};

// Composant enfant pour démontrer l'utilisation
const LoggingExampleContent: React.FC = () => {
    const { isInitialized, stats } = usePowerBIService({
        enableLogging: true,
        trackPerformance: true
    });

    // Exemples de rapports
    const sampleReports = [
        {
            id: 'test-report-1',
            embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=sample-1',
            title: '📊 Rapport Test 1'
        },
        {
            id: 'test-report-2', 
            embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=sample-2',
            title: '📈 Rapport Test 2'
        }
    ];

    return (
        <div>
            {/* Statut du service */}
            <div style={{
                background: isInitialized ? '#d4edda' : '#f8d7da',
                border: '1px solid ' + (isInitialized ? '#c3e6cb' : '#f5c6cb'),
                borderRadius: '6px',
                padding: '15px',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                    🔧 Statut du Service Power BI
                </h3>
                <div style={{ fontSize: '0.9em' }}>
                    <strong>Service initialisé:</strong> {isInitialized ? '✅ Oui' : '❌ Non'}
                    <br />
                    <strong>Instances actives:</strong> {stats.totalInstances}
                    <br />
                    <strong>IDs des instances:</strong> {stats.instanceIds.join(', ') || 'Aucune'}
                </div>
            </div>

            {/* Rapports exemples */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {sampleReports.map((report, index) => (
                    <div key={report.id} style={{
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: '#6c757d',
                            color: 'white',
                            padding: '15px',
                            textAlign: 'center'
                        }}>
                            <h4 style={{ margin: 0 }}>{report.title}</h4>
                            <div style={{ fontSize: '0.8em', marginTop: '5px', opacity: 0.8 }}>
                                Rapport de démonstration #{index + 1}
                            </div>
                        </div>
                        
                        {/* Placeholder pour le rapport */}
                        <div style={{
                            height: '300px',
                            background: '#f8f9fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            color: '#6c757d'
                        }}>
                            <div style={{ fontSize: '3em', marginBottom: '10px' }}>📊</div>
                            <div style={{ textAlign: 'center' }}>
                                <div><strong>Rapport Power BI Simulé</strong></div>
                                <div style={{ fontSize: '0.9em', marginTop: '5px' }}>
                                    ID: {report.id}
                                </div>
                                <div style={{ fontSize: '0.8em', marginTop: '10px', color: '#28a745' }}>
                                    ✅ Logs et tracking configurés selon vos paramètres
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Monitor de performance */}
            <PerformanceMonitor compact={true} />

            {/* Guide d'utilisation */}
            <div style={{
                marginTop: '30px',
                background: '#e3f2fd',
                border: '1px solid #bbdefb',
                borderRadius: '8px',
                padding: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>
                    💡 Guide d'Utilisation du Logging Optionnel
                </h3>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px'
                }}>
                    <div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🔧 En Développement</h4>
                        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                            <li>Logging <strong>activé</strong> pour debug</li>
                            <li>Performance tracking <strong>activé</strong></li>
                            <li>Logs détaillés dans la console</li>
                            <li>Métriques TTFMP/TTI visibles</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🏭 En Production</h4>
                        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                            <li>Logging <strong>désactivé</strong> par défaut</li>
                            <li>Performance tracking <strong>optionnel</strong></li>
                            <li>Meilleure performance</li>
                            <li>Console plus propre</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>⚙️ Configuration</h4>
                        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                            <li>Variables d'environnement</li>
                            <li>Configuration runtime</li>
                            <li>API de contrôle</li>
                            <li>Monitoring sélectif</li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(255,255,255,0.8)',
                    borderRadius: '6px'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>💻 Code d'Exemple</h4>
                    <pre style={{
                        background: '#263238',
                        color: '#eeff41',
                        padding: '15px',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '0.85em',
                        margin: 0
                    }}>
{`// Configuration automatique selon l'environnement
const serviceConfig = {
    accessToken: "YOUR_TOKEN",
    enableLogging: process.env.NODE_ENV !== 'production',
    enablePerformanceTracking: true
};

// Ou configuration manuelle
const serviceConfig = {
    accessToken: "YOUR_TOKEN", 
    enableLogging: false,         // Pas de logs
    enablePerformanceTracking: true  // Garde les métriques
};`}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default LoggingConfigExample;
