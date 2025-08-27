// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import './DemoApp.css';
import EmbedConfigDialog from './components/embed-config-dialog/EmbedConfigDialogComponent';
import { WorkspaceBrowser } from './components/workspace-browser/WorkspaceBrowser';
import { AuthProvider } from './context/AuthContext';
import MPAExample from './components/MPAExample';
import MPAValidation from './components/MPAValidation';
import { SimplePowerBIEmbed } from './components/SimplePowerBIEmbed';

/**
 * Application de démonstration Power BI hybride
 * Interface originale avec workspace selection + fonctionnalités MPA avancées
 */
function DemoAppContent() {
  // États pour l'interface principale PowerBI
  const [accessToken, setAccessToken] = useState<string>('');
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [isEmbedded, setIsEmbedded] = useState<boolean>(false);
  const [isEmbedConfigDialogOpened, setIsEmbedConfigDialogOpened] = useState<boolean>(false);

  // États pour le mode multi-reports
  const [multiReportMode, setMultiReportMode] = useState<boolean>(false);
  const [embeddedReports, setEmbeddedReports] = useState<any[]>([]);

  // États pour l'interface par onglets
  const [activeTab, setActiveTab] = useState('PowerBI');
  const [eventHistory, setEventHistory] = useState<any[]>([]);

  const addEvent = (eventName: string, eventData: any) => {
    const newEvent = {
      name: eventName,
      data: eventData,
      timestamp: new Date().toISOString(),
      tab: activeTab
    };
    setEventHistory(prev => [newEvent, ...prev.slice(0, 49)]);
  };

  const clearEventHistory = () => {
    setEventHistory([]);
  };

  const mockDataGenerator = () => {
    setAccessToken('sample-access-token');
    setEmbedUrl('https://app.powerbi.com/reportEmbed?reportId=sample-report-id');
  };

  const handleEmbedConfigDialogOpen = () => {
    setIsEmbedConfigDialogOpened(true);
  };

  const handleEmbedConfigDialogClose = () => {
    setIsEmbedConfigDialogOpened(false);
  };

  const handleEmbed = (embedUrl: string, accessToken: string) => {
    setAccessToken(accessToken);
    setEmbedUrl(embedUrl);
    setIsEmbedded(true);
    setIsEmbedConfigDialogOpened(false);
    setErrorMessage([]);
  };

  const handleWorkspaceEmbedTokenGenerated = (token: string, url: string) => {
    setAccessToken(token);
    setEmbedUrl(url);
    setIsEmbedded(true);
    setErrorMessage([]);
  };

  const reportLoadedHandler = () => {
    addEvent('loaded', { type: 'report', url: embedUrl });
  };

  const reportRenderedHandler = () => {
    addEvent('rendered', { type: 'report', url: embedUrl });
  };

  const reportErrorHandler = (error: any) => {
    console.error('Report error:', error);
    setErrorMessage(prev => [...prev, error.detail?.message || 'Unknown error']);
    addEvent('error', { error: error.detail?.message || 'Unknown error' });
  };

  // Handlers pour le mode multi-reports
  const handleReportAdded = (report: any) => {
    const newReport = {
      ...report,
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date()
    };
    setEmbeddedReports(prev => [...prev, newReport]);
    addEvent('reportAdded', { 
      reportName: report.name, 
      workspaceName: report.workspaceName,
      totalReports: embeddedReports.length + 1 
    });
  };

  const handleRemoveReport = (reportId: string) => {
    setEmbeddedReports(prev => prev.filter(report => report.id !== reportId));
    addEvent('reportRemoved', { reportId, totalReports: embeddedReports.length - 1 });
  };

  const toggleMultiReportMode = () => {
    const newMode = !multiReportMode;
    setMultiReportMode(newMode);
    
    if (!newMode) {
      // Si on désactive le mode multi-reports, on garde seulement le premier rapport
      if (embeddedReports.length > 0) {
        const firstReport = embeddedReports[0];
        setAccessToken(firstReport.accessToken);
        setEmbedUrl(firstReport.embedUrl);
        setIsEmbedded(true);
        setEmbeddedReports([]);
      }
    } else {
      // Si on active le mode multi-reports, on efface le rapport unique
      setIsEmbedded(false);
      setAccessToken('');
      setEmbedUrl('');
    }
    
    addEvent('modeToggled', { multiReportMode: newMode });
  };

  return (
    <div className="demo-app">
      {/* En-tête unifié */}
      <header className="demo-header">
        <div className="header-content">
          <img
            src="./assets/PowerBI_Icon.png"
            alt="Power BI"
            className="powerbi-icon"
          />
          <h1>Power BI React Demo - Hybrid Mode</h1>
          <div className="header-actions">
            <span className="active-tab-indicator">Mode: {activeTab}</span>
            <button
              className="github-link"
              onClick={() =>
                window.open(
                  "https://github.com/Microsoft/powerbi-client-react",
                  "_blank"
                )
              }
            >
              <img src="./assets/GitHub_Icon.png" alt="GitHub" />
              GitHub
            </button>
          </div>
        </div>
      </header>

      {/* Navigation par onglets */}
      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "PowerBI" ? "active" : ""}`}
          onClick={() => setActiveTab("PowerBI")}
        >
          🏠 PowerBI Interface
        </button>
        <button
          className={`tab-button ${activeTab === "MPA" ? "active" : ""}`}
          onClick={() => setActiveTab("MPA")}
        >
          🔄 MPA Demo
        </button>
        <button
          className={`tab-button ${activeTab === "Validation" ? "active" : ""}`}
          onClick={() => setActiveTab("Validation")}
        >
          🧪 Validation
        </button>
        <button
          className={`tab-button ${activeTab === "Events" ? "active" : ""}`}
          onClick={() => setActiveTab("Events")}
        >
          📋 Events ({eventHistory.length})
        </button>
        <button
          className={`tab-button ${activeTab === "Guide" ? "active" : ""}`}
          onClick={() => setActiveTab("Guide")}
        >
          📖 Guide
        </button>
      </nav>

      {/* Contenu principal */}
      <main className="demo-content">
        {/* Onglet Interface PowerBI Originale */}
        {activeTab === "PowerBI" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>🏠 Power BI Embedded multi-report viewer</h2>
              <p>
                Interface de démonstration avec sélection de workspace et
                connexion Microsoft ID.
              </p>
            </div>

            <div className="powerbi-interface">
              {/* Mode Toggle */}
              <div className="mode-selector">
                <label className="toggle-container">
                  <input
                    type="checkbox"
                    checked={multiReportMode}
                    onChange={toggleMultiReportMode}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {multiReportMode
                      ? "📊 Mode Multi-Reports"
                      : "📋 Mode Rapport Unique"}
                  </span>
                </label>
                <p className="mode-description">
                  {multiReportMode
                    ? "Sélectionnez et gérez plusieurs rapports simultanément"
                    : "Affichez un seul rapport à la fois"}
                </p>
              </div>

              <div className="interface-grid">
                <div className="workspace-panel">
                  <h3>📁 Workspace Browser</h3>
                  <p>
                    Connectez-vous avec votre Microsoft ID et sélectionnez un
                    workspace :
                  </p>
                  <div className="workspace-container">
                    <WorkspaceBrowser
                      onEmbedTokenGenerated={
                        !multiReportMode
                          ? handleWorkspaceEmbedTokenGenerated
                          : undefined
                      }
                      onReportAdded={
                        multiReportMode ? handleReportAdded : undefined
                      }
                      multiReportMode={multiReportMode}
                      iframeMode={false}
                    />
                  </div>
                </div>

                <div className="manual-config-panel">
                  <h3>⚙️ Configuration Manuelle</h3>
                  <p>Ou configurez manuellement avec votre propre token :</p>
                  <div className="button-container">
                    <button
                      className="action-button primary"
                      onClick={handleEmbedConfigDialogOpen}
                    >
                      🔧 Configurer Manuellement
                    </button>
                    <button
                      className="action-button secondary"
                      onClick={mockDataGenerator}
                    >
                      🎭 Données d'exemple
                    </button>
                  </div>
                </div>
              </div>

              {/* Zone d'embedding - Mode Rapport Unique */}
              {!multiReportMode && isEmbedded && accessToken && embedUrl && (
                <div className="embed-section">
                  <h3>📊 Report Embed</h3>
                  <div className="embed-container">
                    <SimplePowerBIEmbed
                      reportId={embedUrl.split('reportId=')[1]?.split('&')[0] || 'unknown-report'}
                      embedUrl={embedUrl}
                      accessToken={accessToken}
                      onLoaded={reportLoadedHandler}
                      onError={reportErrorHandler}
                      height="500px"
                    />
                  </div>
                </div>
              )}

              {/* Zone d'embedding - Mode Multi-Reports */}
              {multiReportMode && (
                <div className="multi-reports-section">
                  <div className="multi-reports-header">
                    <h3>📊 Reports Multiples ({embeddedReports.length})</h3>
                    <p>
                      Gérez tous vos rapports Power BI dans une seule interface
                    </p>
                  </div>

                  {embeddedReports.length === 0 ? (
                    <div className="no-reports-message">
                      <p>🎯 Aucun rapport sélectionné</p>
                      <p>
                        Utilisez le Workspace Browser ci-dessus pour ajouter des
                        rapports.
                      </p>
                    </div>
                  ) : (
                    <div className="reports-grid">
                      {embeddedReports.map((report) => (
                        <div key={report.id} className="report-card">
                          <div className="report-header">
                            <h4>{report.name}</h4>
                            <button
                              className="remove-report-btn"
                              onClick={() => handleRemoveReport(report.id)}
                            >
                              ❌
                            </button>
                          </div>
                          <div className="report-info">
                            <p>
                              <strong>Workspace:</strong> {report.workspaceName}
                            </p>
                            <p>
                              <strong>Dataset:</strong> {report.datasetName}
                            </p>
                            <p>
                              <strong>Type:</strong> {report.reportType}
                            </p>
                            <p>
                              <strong>Ajouté:</strong>{" "}
                              {report.addedAt.toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="report-embed-container">
                            <SimplePowerBIEmbed
                              reportId={report.embedUrl.split('reportId=')[1]?.split('&')[0] || report.id}
                              embedUrl={report.embedUrl}
                              accessToken={report.accessToken}
                              onLoaded={(reportInstance: any) => {
                                console.log(`Report ${report.name} loaded:`, reportInstance);
                                addEvent('multiReportLoaded', { 
                                  reportName: report.name, 
                                  reportId: report.id 
                                });
                              }}
                              onError={(error: any) => {
                                console.error(`Report ${report.name} error:`, error);
                                addEvent('multiReportError', { 
                                  reportName: report.name, 
                                  reportId: report.id, 
                                  error: error.message || 'Unknown error' 
                                });
                              }}
                              height="300px"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Messages d'erreur */}
              {errorMessage.length > 0 && (
                <div className="error-section">
                  <h3>❌ Erreurs</h3>
                  <div className="error-list">
                    {errorMessage.map((error, index) => (
                      <div key={index} className="error-item">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {!isEmbedded && (
                <div className="instructions-section">
                  <h3>🚀 Comment commencer</h3>
                  <div className="instruction-steps">
                    <div className="step">
                      <span className="step-number">1</span>
                      <div className="step-content">
                        <h4>Connexion Microsoft</h4>
                        <p>
                          Utilisez le Workspace Browser pour vous connecter avec
                          votre Microsoft ID et accéder à vos workspaces Power
                          BI.
                        </p>
                      </div>
                    </div>
                    <div className="step">
                      <span className="step-number">2</span>
                      <div className="step-content">
                        <h4>Sélection du contenu</h4>
                        <p>
                          Choisissez un workspace, puis un dataset, et enfin un
                          report à visualiser.
                        </p>
                      </div>
                    </div>
                    <div className="step">
                      <span className="step-number">3</span>
                      <div className="step-content">
                        <h4>Configuration manuelle</h4>
                        <p>
                          Alternativement, utilisez la configuration manuelle si
                          vous avez déjà un token et une URL d'embedding.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet MPA Demo */}
        {activeTab === "MPA" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>🔄 Démonstration MPA</h2>
              <p>
                Architecture Multi-Page Application avec persistence et
                optimisations avancées.
              </p>
            </div>
            <MPAExample onEvent={addEvent} />
          </div>
        )}

        {/* Onglet Validation */}
        {activeTab === "Validation" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>🧪 Tests et Validation</h2>
              <p>
                Tests automatisés des fonctionnalités MPA et validation de
                l'architecture.
              </p>
            </div>
            <MPAValidation onEvent={addEvent} />
          </div>
        )}

        {/* Onglet Events */}
        {activeTab === "Events" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>📋 Historique des Événements</h2>
              <p>Suivi en temps réel des événements PowerBI et MPA.</p>
              <button onClick={clearEventHistory} className="clear-button">
                🗑️ Vider l'historique
              </button>
            </div>
            <div className="events-container">
              {eventHistory.length === 0 ? (
                <div className="no-events">
                  <p>Aucun événement enregistré pour le moment.</p>
                </div>
              ) : (
                <div className="events-list">
                  {eventHistory.map((event, index) => (
                    <div key={index} className="event-item">
                      <div className="event-header">
                        <span className="event-name">{event.name}</span>
                        <span className="event-tab">{event.tab}</span>
                        <span className="event-time">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="event-data">
                        <pre>{JSON.stringify(event.data, null, 2)}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Guide */}
        {activeTab === "Guide" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>📖 Guide d'utilisation Hybride</h2>
              <p>
                Documentation complète pour l'utilisation de l'interface
                hybride.
              </p>
            </div>

            <div className="guide-content">
              <div className="guide-section">
                <h3>🏠 Power BI Embedded multi-report viewer</h3>
                <p>
                  L'interface principale offre la fonctionnalité de base de
                  PowerBI-client-react :
                </p>
                <ul>
                  <li>
                    <strong>Workspace Browser:</strong> Connectez-vous avec
                    Microsoft ID et naviguez dans vos workspaces
                  </li>
                  <li>
                    <strong>Sélection intuitive:</strong> Choisissez workspace →
                    dataset → report
                  </li>
                  <li>
                    <strong>Configuration manuelle:</strong> Alternative avec
                    token et URL personnalisés
                  </li>
                  <li>
                    <strong>Embedding standard:</strong> Affichage classique de
                    reports PowerBI
                  </li>
                </ul>
              </div>

              <div className="guide-section">
                <h3>🔄 Fonctionnalités MPA Avancées</h3>
                <p>Architecture Multi-Page Application avec optimisations :</p>
                <ul>
                  <li>
                    <strong>Singleton Service:</strong> Une seule instance du
                    service PowerBI par application
                  </li>
                  <li>
                    <strong>Persistence automatique:</strong> Conservation des
                    données entre les pages
                  </li>
                  <li>
                    <strong>Performance tracking:</strong> Métriques TTFMP/TTI
                    automatiques
                  </li>
                  <li>
                    <strong>Gestion multi-rapports:</strong> Support de 5+
                    rapports simultanés
                  </li>
                  <li>
                    <strong>Logging optionnel:</strong> Système de
                    journalisation configurable
                  </li>
                </ul>
              </div>

              <div className="guide-section">
                <h3>🧪 Tests et Validation</h3>
                <p>Outils de validation et de test intégrés :</p>
                <ul>
                  <li>
                    <strong>Tests automatisés:</strong> Validation des services
                    MPA
                  </li>
                  <li>
                    <strong>Métriques de performance:</strong> Mesure des temps
                    de chargement
                  </li>
                  <li>
                    <strong>Tests de persistence:</strong> Vérification de la
                    sauvegarde
                  </li>
                  <li>
                    <strong>Monitoring des erreurs:</strong> Détection et
                    reporting automatiques
                  </li>
                </ul>
              </div>

              <div className="guide-section">
                <h3>📋 Suivi des Événements</h3>
                <p>Surveillance en temps réel de tous les événements :</p>
                <ul>
                  <li>
                    <strong>Événements PowerBI:</strong> loaded, rendered,
                    error, pageChanged
                  </li>
                  <li>
                    <strong>Événements MPA:</strong> initialize, embed, cleanup,
                    performance
                  </li>
                  <li>
                    <strong>Données détaillées:</strong> Horodatage et contexte
                    complets
                  </li>
                  <li>
                    <strong>Historique persistant:</strong> Conservation des 50
                    derniers événements
                  </li>
                </ul>
              </div>

              <div className="guide-section">
                <h3>⚡ Avantages de l'Architecture Hybride</h3>
                <div className="features-grid">
                  <div className="feature-card">
                    <h4>🔄 Compatibilité</h4>
                    <p>Interface familière + fonctionnalités avancées</p>
                  </div>
                  <div className="feature-card">
                    <h4>📈 Performance</h4>
                    <p>Optimisations MPA + tracking automatique</p>
                  </div>
                  <div className="feature-card">
                    <h4>🔧 Flexibilité</h4>
                    <p>Choix entre approche classique ou MPA</p>
                  </div>
                  <div className="feature-card">
                    <h4>📊 Monitoring</h4>
                    <p>Visibilité complète sur les performances</p>
                  </div>
                </div>
              </div>

              <div className="guide-section">
                <h3>📋 Checklist de déploiement</h3>
                <div className="checklist">
                  <label>
                    <input type="checkbox" /> ✅ Interface PowerBI fonctionnelle
                  </label>
                  <label>
                    <input type="checkbox" /> ✅ Authentification Microsoft
                    configurée
                  </label>
                  <label>
                    <input type="checkbox" /> ✅ Service MPA initialisé
                  </label>
                  <label>
                    <input type="checkbox" /> ✅ Performance tracking activé
                  </label>
                  <label>
                    <input type="checkbox" /> ✅ Gestion d'erreurs implémentée
                  </label>
                  <label>
                    <input type="checkbox" /> ✅ Tests de validation réussis
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pied de page */}
      <footer className="demo-footer">
        <div className="footer-content">
          <p>
            &copy; 2024 Microsoft Corporation. Interface hybride PowerBI React
            avec support MPA.
          </p>
          <div className="footer-links">
            <a
              href="https://learn.microsoft.com/power-bi/"
              target="_blank"
              rel="noopener noreferrer"
            >
              📚 Documentation PowerBI
            </a>
            <a
              href="https://github.com/Microsoft/powerbi-client-react"
              target="_blank"
              rel="noopener noreferrer"
            >
              🔧 GitHub Repository
            </a>
          </div>
        </div>
      </footer>

      {/* Dialog de configuration */}
      <EmbedConfigDialog
        isOpen={isEmbedConfigDialogOpened}
        onRequestClose={handleEmbedConfigDialogClose}
        onEmbed={handleEmbed}
      />
    </div>
  );
}

export default function DemoApp() {
  return (
    <AuthProvider>
      <DemoAppContent />
    </AuthProvider>
  );
}
