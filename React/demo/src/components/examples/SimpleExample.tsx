/**
 * Exemple simple d'utilisation du service Power BI singleton
 * Montre comment utiliser une seule instance pour plusieurs rapports
 */

import React from 'react';
import { PowerBIServiceProvider } from '../PowerBIServiceProvider';
import { OptimizedPowerBIEmbed } from '../optimized-powerbi/OptimizedPowerBIEmbed';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { Report } from 'powerbi-client';

// Exemple de données de rapports
const sampleReports = [
    {
        id: 'sales-report',
        embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=sample-sales-report',
        title: '📊 Rapport des Ventes',
        priority: 'high' as const
    },
    {
        id: 'marketing-report', 
        embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=sample-marketing-report',
        title: '📈 Rapport Marketing',
        priority: 'normal' as const
    },
    {
        id: 'financial-report',
        embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=sample-financial-report', 
        title: '💰 Rapport Financier',
        priority: 'low' as const
    }
];

export const SimpleExample: React.FC = () => {
    // Dans un vrai projet, ce token viendrait de votre authentification
    const accessToken = "YOUR_POWERBI_ACCESS_TOKEN";

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>🔄 Exemple: Service Power BI Singleton</h1>
            <p style={{ marginBottom: '30px', color: '#666' }}>
                Cette page utilise <strong>une seule instance</strong> du service Power BI 
                pour afficher plusieurs rapports, optimisant ainsi les performances et la mémoire.
            </p>

            {/* 
                PowerBIServiceProvider initialise le service singleton une seule fois
                Tous les composants enfants partageront cette même instance
            */}
            <PowerBIServiceProvider
                accessToken={accessToken}
                autoTokenRefresh={true}
                tokenRefreshInterval={50}
            >
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    {sampleReports.map((report, index) => (
                        <div key={report.id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderBottom: '1px solid #ddd',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '1.1em' }}>
                                    {report.title}
                                </h3>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.8em',
                                    fontWeight: 'bold',
                                    background: report.priority === 'high' ? '#dc3545' : 
                                              report.priority === 'normal' ? '#ffc107' : '#17a2b8',
                                    color: report.priority === 'normal' ? '#212529' : 'white'
                                }}>
                                    {report.priority}
                                </span>
                            </div>
                            
                            {/* 
                                Chaque OptimizedPowerBIEmbed utilise automatiquement 
                                le service singleton initialisé par le Provider
                            */}
                            <OptimizedPowerBIEmbed
                                reportId={report.id}
                                embedUrl={report.embedUrl}
                                accessToken={accessToken}
                                priority={report.priority}
                                lazyLoad={index >= 2} // Lazy load pour les rapports 3+
                                height="400px"
                                showLoadingState={true}
                                onLoaded={(reportInstance: Report) => {
                                    console.log(`✅ ${report.title} chargé avec le service singleton`);
                                }}
                                onError={(error: Error) => {
                                    console.error(`❌ Erreur pour ${report.title}:`, error);
                                }}
                                resourceOptimization={
                                    report.priority === 'low' ? {
                                        disableAnimations: true,
                                        reduceQuality: true,
                                        limitRefreshRate: true
                                    } : {}
                                }
                            />
                        </div>
                    ))}
                </div>

                {/* Monitor de Performance */}
                <div style={{ marginTop: '30px' }}>
                    <PerformanceMonitor 
                        updateInterval={3000}
                        onMetricsUpdate={(metrics) => {
                            console.log('📊 Métriques de performance mises à jour:', metrics);
                        }}
                    />
                </div>

                <div style={{
                    background: '#e3f2fd',
                    padding: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2196f3'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>
                        💡 Avantages du Service Singleton
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '15px'
                    }}>
                        <div>
                            <strong>🚀 Performance</strong>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                                Une seule instance Power BI partagée entre tous les rapports
                            </p>
                        </div>
                        <div>
                            <strong>💾 Mémoire</strong>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                                Réduction significative de l'empreinte mémoire
                            </p>
                        </div>
                        <div>
                            <strong>🔄 Token</strong>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                                Mise à jour automatique pour toutes les instances
                            </p>
                        </div>
                        <div>
                            <strong>🛠️ Maintenance</strong>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                                Configuration centralisée et cleanup automatique
                            </p>
                        </div>
                    </div>
                </div>
            </PowerBIServiceProvider>

            <div style={{
                marginTop: '30px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '4px solid #28a745'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#155724' }}>
                    🔧 Comment ça marche
                </h3>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>
                        <strong>PowerBIServiceProvider</strong> initialise le service singleton une seule fois
                    </li>
                    <li>
                        Tous les <strong>OptimizedPowerBIEmbed</strong> utilisent cette même instance
                    </li>
                    <li>
                        Le service gère automatiquement les <strong>IDs uniques</strong> et le <strong>cleanup</strong>
                    </li>
                    <li>
                        Les <strong>tokens sont partagés</strong> et mis à jour automatiquement
                    </li>
                    <li>
                        <strong>Gestion d'erreur</strong> individuelle par rapport avec fallback global
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default SimpleExample;
