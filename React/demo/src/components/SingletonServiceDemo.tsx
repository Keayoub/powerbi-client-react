/**
 * Exemple d'utilisation du service Power BI singleton
 * Démontre comment réutiliser une seule instance du service pour toute la page
 */

import React from 'react';
import { models } from 'powerbi-client';
import { PowerBIServiceProvider } from '../components/PowerBIServiceProvider';
import { OptimizedPowerBIEmbed } from '../components/optimized-powerbi/OptimizedPowerBIEmbed';
import { MultiReportDemo } from '../components/multi-report-demo/MultiReportDemo';

interface SingletonServiceDemoProps {
    accessToken: string;
    reports: Array<{
        id: string;
        embedUrl: string;
        title: string;
        priority?: 'high' | 'normal' | 'low';
    }>;
}

export const SingletonServiceDemo: React.FC<SingletonServiceDemoProps> = ({
    accessToken,
    reports
}) => {
    return (
        <div className="singleton-service-demo">
            <header className="demo-header">
                <h1>🔄 Service Power BI Singleton</h1>
                <p className="demo-description">
                    Démonstration de la réutilisation d'une seule instance du service Power BI 
                    pour tous les rapports de la page. Cette approche optimise les performances 
                    et la gestion des ressources.
                </p>
            </header>

            {/* Provider unique pour toute la page - initialise le service singleton */}
            <PowerBIServiceProvider
                accessToken={accessToken}
                autoTokenRefresh={true}
                tokenRefreshInterval={50}
                globalSettings={{
                    background: models.BackgroundType.Transparent,
                    filterPaneEnabled: false,
                    navContentPaneEnabled: true
                }}
            >
                <div className="demo-content">
                    <div className="benefits-section">
                        <h2>✅ Avantages du Service Singleton</h2>
                        <div className="benefits-grid">
                            <div className="benefit-card">
                                <div className="benefit-icon">🚀</div>
                                <h3>Performance Optimisée</h3>
                                <p>Une seule instance du service Power BI partagée entre tous les rapports</p>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon">💾</div>
                                <h3>Gestion Mémoire</h3>
                                <p>Réduction significative de l'empreinte mémoire</p>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon">🔄</div>
                                <h3>Token Partagé</h3>
                                <p>Mise à jour automatique du token pour toutes les instances</p>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon">🛠️</div>
                                <h3>Maintenance Simplifiée</h3>
                                <p>Configuration centralisée et cleanup automatique</p>
                            </div>
                        </div>
                    </div>

                    <div className="implementation-section">
                        <h2>🔧 Implémentation</h2>
                        <div className="code-example">
                            <h3>1. Wrapper de page avec le Provider</h3>
                            <pre>{`<PowerBIServiceProvider
    accessToken={accessToken}
    autoTokenRefresh={true}
    globalSettings={{ background: 'transparent' }}
>
    {/* Tous vos composants PowerBI */}
</PowerBIServiceProvider>`}</pre>
                        </div>

                        <div className="code-example">
                            <h3>2. Composants utilisant le service singleton</h3>
                            <pre>{`<OptimizedPowerBIEmbed
    reportId="report-1"
    embedUrl={embedUrl}
    accessToken={accessToken}
    priority="high"
    // Le service singleton est automatiquement utilisé
/>`}</pre>
                        </div>
                    </div>

                    <div className="reports-section">
                        <h2>📊 Rapports avec Service Singleton</h2>
                        <p className="section-description">
                            Tous ces rapports utilisent la même instance du service Power BI,
                            optimisant ainsi les performances et la gestion des ressources.
                        </p>

                        <div className="reports-container">
                            {reports.map((report, index) => (
                                <div key={report.id} className="report-wrapper">
                                    <div className="report-meta">
                                        <h4>{report.title}</h4>
                                        <span className="report-order">#{index + 1}</span>
                                        <span className={`priority priority-${report.priority || 'normal'}`}>
                                            {report.priority || 'normal'}
                                        </span>
                                    </div>
                                    
                                    <OptimizedPowerBIEmbed
                                        reportId={report.id}
                                        embedUrl={report.embedUrl}
                                        accessToken={accessToken}
                                        priority={report.priority || 'normal'}
                                        lazyLoad={index >= 2}
                                        height="400px"
                                        className="singleton-report"
                                        showLoadingState={true}
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
                    </div>

                    <div className="technical-details">
                        <h2>🔍 Détails Techniques</h2>
                        <div className="tech-grid">
                            <div className="tech-item">
                                <strong>Service Singleton:</strong>
                                <span>Une seule instance `powerBIService` pour toute la page</span>
                            </div>
                            <div className="tech-item">
                                <strong>Gestion d'État:</strong>
                                <span>Chaque rapport maintient son état local tout en partageant le service</span>
                            </div>
                            <div className="tech-item">
                                <strong>Event Handling:</strong>
                                <span>Events gérés individuellement par rapport, service partagé pour l'embedding</span>
                            </div>
                            <div className="tech-item">
                                <strong>Token Management:</strong>
                                <span>Mise à jour automatique du token pour tous les rapports simultanément</span>
                            </div>
                            <div className="tech-item">
                                <strong>Memory Management:</strong>
                                <span>Cleanup automatique au changement de page, instances trackées centralement</span>
                            </div>
                            <div className="tech-item">
                                <strong>Error Handling:</strong>
                                <span>Gestion d'erreur individuelle + fallback global du service</span>
                            </div>
                        </div>
                    </div>
                </div>
            </PowerBIServiceProvider>
        </div>
    );
};

// Styles CSS pour la démo
const demoStyles = `
.singleton-service-demo {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 40px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
}

.demo-header h1 {
    margin: 0 0 16px 0;
    font-size: 2.5em;
    font-weight: 700;
}

.demo-description {
    font-size: 1.1em;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
}

.demo-content {
    display: flex;
    flex-direction: column;
    gap: 40px;
}

.benefits-section {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 12px;
    border: 1px solid #dee2e6;
}

.benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.benefit-card {
    background: white;
    padding: 24px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.benefit-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.benefit-icon {
    font-size: 2.5em;
    margin-bottom: 16px;
}

.benefit-card h3 {
    margin: 0 0 12px 0;
    color: #495057;
    font-size: 1.2em;
}

.benefit-card p {
    margin: 0;
    color: #6c757d;
    line-height: 1.5;
}

.implementation-section {
    background: white;
    padding: 30px;
    border-radius: 12px;
    border: 1px solid #dee2e6;
}

.code-example {
    margin: 20px 0;
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #007acc;
}

.code-example h3 {
    margin: 0 0 12px 0;
    color: #495057;
    font-size: 1.1em;
}

.code-example pre {
    margin: 0;
    padding: 0;
    background: none;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
    color: #495057;
    overflow-x: auto;
    white-space: pre-wrap;
}

.reports-section {
    background: white;
    padding: 30px;
    border-radius: 12px;
    border: 1px solid #dee2e6;
}

.section-description {
    color: #6c757d;
    margin-bottom: 30px;
    font-size: 1.05em;
    line-height: 1.6;
}

.reports-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 24px;
}

.report-wrapper {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.report-meta {
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.report-meta h4 {
    margin: 0;
    color: #495057;
    font-size: 1.1em;
}

.report-order {
    background: #6c757d;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
}

.priority {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
}

.priority-high { background: #dc3545; color: white; }
.priority-normal { background: #ffc107; color: #212529; }
.priority-low { background: #17a2b8; color: white; }

.singleton-report {
    border: none !important;
    border-radius: 0 !important;
}

.technical-details {
    background: #e9ecef;
    padding: 30px;
    border-radius: 12px;
}

.tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-top: 20px;
}

.tech-item {
    background: white;
    padding: 16px;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tech-item strong {
    color: #495057;
    font-size: 0.95em;
}

.tech-item span {
    color: #6c757d;
    font-size: 0.9em;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .demo-header h1 {
        font-size: 2em;
    }
    
    .benefits-grid {
        grid-template-columns: 1fr;
    }
    
    .reports-container {
        grid-template-columns: 1fr;
    }
    
    .report-meta {
        flex-direction: column;
        align-items: flex-start;
    }
}
`;

// Injecter les styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = demoStyles;
    document.head.appendChild(styleSheet);
}
