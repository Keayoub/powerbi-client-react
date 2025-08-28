// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useRef, useCallback } from "react";
import { EmbeddedPowerBIContainer } from "../components/EmbeddedPowerBIContainer";
import PowerBIErrorBoundary from "../components/PowerBIErrorBoundary";
import { WorkspaceBrowser } from "../components/workspace-browser/WorkspaceBrowser";

interface OptimizedReport {
  id: string;
  name: string;
  embedUrl: string;
  accessToken: string;
  workspaceName: string;
  priority: "high" | "normal" | "low";
  lazyLoad: boolean;
  addedAt: Date;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  totalReports: number;
  activeReports: number;
}

export function MPATestPage() {
  const [optimizedReports, setOptimizedReports] = useState<OptimizedReport[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedWorkspaceReport, setSelectedWorkspaceReport] = useState<{
    embedUrl: string;
    accessToken: string;
    reportId: string;
    name: string;
    workspaceName: string;
  } | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    totalReports: 0,
    activeReports: 0
  });
  const [maxConcurrentLoads, setMaxConcurrentLoads] = useState(3);
  const [resourceOptimization, setResourceOptimization] = useState({
    disableAnimations: false,
    reduceQuality: false,
    limitRefreshRate: false
  });
  const testRunIdRef = useRef(0);

  const addOptimizedReport = (priority: "high" | "normal" | "low" = "normal", lazyLoad: boolean = false, useWorkspaceReport: boolean = false) => {
    let reportData;
    
    if (useWorkspaceReport && selectedWorkspaceReport) {
      // Use real workspace report with proper ID extraction
      const reportId = selectedWorkspaceReport.reportId || 
                      selectedWorkspaceReport.embedUrl.split("reportId=")[1]?.split("&")[0] || 
                      `workspace-${Date.now()}`;
      
      reportData = {
        id: `optimized-${reportId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${selectedWorkspaceReport.name} (${priority})`,
        embedUrl: selectedWorkspaceReport.embedUrl,
        accessToken: selectedWorkspaceReport.accessToken,
        workspaceName: selectedWorkspaceReport.workspaceName,
        priority,
        lazyLoad,
        addedAt: new Date()
      };
      
      console.log(`✅ Adding workspace report: ${reportData.name}`, {
        reportId: reportId,
        embedUrl: reportData.embedUrl,
        hasToken: !!reportData.accessToken
      });
    } else {
      // Use sample report data
      reportData = {
        id: `optimized-report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `Sample Report ${optimizedReports.length + 1} (${priority})`,
        embedUrl: `https://app.powerbi.com/reportEmbed?reportId=sample-${optimizedReports.length + 1}`,
        accessToken: "sample-access-token-optimized",
        workspaceName: "Sample Workspace",
        priority,
        lazyLoad,
        addedAt: new Date()
      };
      
      console.log(`⚠️ Adding sample report: ${reportData.name} (no workspace report selected)`);
    }
    
    const newReport: OptimizedReport = reportData;
    setOptimizedReports(prev => [...prev, newReport]);
    
    setPerformanceMetrics(prev => ({
      ...prev,
      totalReports: prev.totalReports + 1,
      activeReports: prev.activeReports + 1
    }));
  };

  const removeOptimizedReport = (reportId: string) => {
    setOptimizedReports(prev => prev.filter(report => report.id !== reportId));
    
    setPerformanceMetrics(prev => ({
      ...prev,
      totalReports: Math.max(0, prev.totalReports - 1),
      activeReports: Math.max(0, prev.activeReports - 1)
    }));
  };

  const handleReportLoaded = useCallback((reportId: string) => (report: any) => {
    console.log(`✅ Optimized report ${reportId} loaded with singleton service:`, report);
    const loadTime = Date.now();
    setPerformanceMetrics(prev => ({
      ...prev,
      loadTime: loadTime,
      renderTime: loadTime
    }));
  }, []);

  const handleReportError = useCallback((reportId: string) => (error: any) => {
    console.error(`❌ Optimized report ${reportId} error:`, error);
  }, []);

  const handleWorkspaceReportSelected = (report: any) => {
    setSelectedWorkspaceReport({
      embedUrl: report.embedUrl,
      accessToken: report.accessToken,
      reportId: report.reportId || report.id,
      name: report.name,
      workspaceName: report.workspaceName || "Selected Workspace"
    });
    console.log("✅ Workspace report selected for optimization testing:", report);
  };

  const runPerformanceTest = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    testRunIdRef.current += 1;
    
    try {
      // Clear existing reports
      setOptimizedReports([]);
      setPerformanceMetrics({
        loadTime: 0,
        renderTime: 0,
        totalReports: 0,
        activeReports: 0
      });

      const startTime = Date.now();
      const useWorkspace = selectedWorkspaceReport !== null;
      
      console.log(`🧪 Starting performance test with ${useWorkspace ? 'workspace' : 'sample'} reports`);
      if (useWorkspace) {
        console.log('📊 Using workspace report:', selectedWorkspaceReport);
      }

      // Add reports with different priorities - all using the same workspace report if available
      console.log('Adding high priority report...');
      addOptimizedReport("high", false, useWorkspace);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Adding normal priority lazy report...');
      addOptimizedReport("normal", true, useWorkspace);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Adding low priority lazy report...');
      addOptimizedReport("low", true, useWorkspace);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('Adding final normal priority report...');
      addOptimizedReport("normal", false, useWorkspace);

      const endTime = Date.now();
      setPerformanceMetrics(prev => ({
        ...prev,
        loadTime: endTime - startTime
      }));
      
      console.log(`✅ Performance test completed in ${endTime - startTime}ms`);

    } finally {
      setIsRunning(false);
    }
  };

  const clearAllReports = () => {
    setOptimizedReports([]);
    setPerformanceMetrics({
      loadTime: 0,
      renderTime: 0,
      totalReports: 0,
      activeReports: 0
    });
  };

  return (
    <div className="mpa-test-page">
      {/* Page Header */}
      <div className="page-header">
        <h2>🚀 Advanced Optimization & Singleton Implementation</h2>
        <p>Test OptimizedPowerBIEmbed with singleton service, lazy loading, and performance optimization</p>
      </div>

      {/* Workspace Selection Section */}
      <div className="workspace-selection-section">
        <div className="section-header">
          <h3>📁 Report Selection for Optimization Testing</h3>
          <p>Select a real PowerBI report from your workspace to test optimization features</p>
        </div>
        
        <div className="workspace-browser-container">
          <div className="workspace-status">
            {selectedWorkspaceReport ? (
              <div className="selected-report-info">
                <h4>✅ Selected Report: {selectedWorkspaceReport.name}</h4>
                <p><strong>Workspace:</strong> {selectedWorkspaceReport.workspaceName}</p>
                <p><strong>Report ID:</strong> {selectedWorkspaceReport.reportId}</p>
                <button 
                  className="action-button secondary"
                  onClick={() => setSelectedWorkspaceReport(null)}
                >
                  🔄 Select Different Report
                </button>
              </div>
            ) : (
              <div className="no-selection-info">
                <p>🎯 No report selected - using sample data for testing</p>
                <p>Connect with your Microsoft ID below to select a real report:</p>
              </div>
            )}
          </div>
          
          {!selectedWorkspaceReport && (
            <WorkspaceBrowser
              onEmbedTokenGenerated={(token, url) => {
                // Extract report info from the URL and token
                const reportId = url.split("reportId=")[1]?.split("&")[0] || "unknown";
                handleWorkspaceReportSelected({
                  embedUrl: url,
                  accessToken: token,
                  reportId: reportId,
                  name: `Report ${reportId.substring(0, 8)}...`,
                  workspaceName: "Selected Workspace"
                });
              }}
              onReportAdded={handleWorkspaceReportSelected}
              multiReportMode={false}
              iframeMode={false}
            />
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="optimization-controls">
        <div className="control-section">
          <h3>🎛️ Optimization Controls</h3>
          
          <div className="control-grid">
            <div className="control-group">
              <label>Max Concurrent Loads:</label>
              <input
                type="number"
                value={maxConcurrentLoads}
                onChange={(e) => setMaxConcurrentLoads(parseInt(e.target.value) || 3)}
                min="1"
                max="10"
                className="form-input small"
              />
            </div>
            
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={resourceOptimization.disableAnimations}
                  onChange={(e) => setResourceOptimization(prev => ({
                    ...prev,
                    disableAnimations: e.target.checked
                  }))}
                />
                Disable Animations
              </label>
            </div>
            
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={resourceOptimization.reduceQuality}
                  onChange={(e) => setResourceOptimization(prev => ({
                    ...prev,
                    reduceQuality: e.target.checked
                  }))}
                />
                Reduce Quality
              </label>
            </div>
            
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={resourceOptimization.limitRefreshRate}
                  onChange={(e) => setResourceOptimization(prev => ({
                    ...prev,
                    limitRefreshRate: e.target.checked
                  }))}
                />
                Limit Refresh Rate
              </label>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => addOptimizedReport("high", false, selectedWorkspaceReport !== null)}
            className="action-button primary"
          >
            ➕ Add High Priority Report {selectedWorkspaceReport ? "(Workspace)" : "(Sample)"}
          </button>
          <button 
            onClick={() => addOptimizedReport("normal", true, selectedWorkspaceReport !== null)}
            className="action-button secondary"
          >
            ➕ Add Normal Priority (Lazy) {selectedWorkspaceReport ? "(Workspace)" : "(Sample)"}
          </button>
          <button 
            onClick={() => addOptimizedReport("low", true, selectedWorkspaceReport !== null)}
            className="action-button secondary"
          >
            ➕ Add Low Priority (Lazy) {selectedWorkspaceReport ? "(Workspace)" : "(Sample)"}
          </button>
          <button 
            onClick={runPerformanceTest}
            className="action-button primary"
            disabled={isRunning}
          >
            {isRunning ? "🔄 Running Test..." : `🧪 Run Performance Test ${selectedWorkspaceReport ? "(Workspace)" : "(Sample)"}`}
          </button>
          <button 
            onClick={clearAllReports}
            className="action-button danger"
          >
            🗑️ Clear All Reports
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-dashboard">
        <h3>📊 Performance Dashboard</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Load Time</h4>
            <p>{performanceMetrics.loadTime}ms</p>
          </div>
          <div className="metric-card">
            <h4>Active Reports</h4>
            <p>{performanceMetrics.activeReports}</p>
          </div>
          <div className="metric-card">
            <h4>Total Reports</h4>
            <p>{performanceMetrics.totalReports}</p>
          </div>
          <div className="metric-card">
            <h4>Concurrent Limit</h4>
            <p>{maxConcurrentLoads}</p>
          </div>
          <div className="metric-card">
            <h4>Report Source</h4>
            <p>{selectedWorkspaceReport ? "🏢 Workspace" : "🧪 Sample"}</p>
          </div>
          <div className="metric-card">
            <h4>Workspace Reports</h4>
            <p>{selectedWorkspaceReport ? optimizedReports.length : 0} / {optimizedReports.length}</p>
          </div>
        </div>
      </div>

      {/* Optimized Reports Section */}
      <div className="optimized-reports-section">
        <div className="section-header">
          <h3>⚡ Multiple Reports with Stable Embedding</h3>
          <p>Each report uses EmbeddedPowerBIContainer with complete DOM isolation</p>
          <p><strong>DOM Mode:</strong> Isolated (No DOM conflicts - Stable Solution)</p>
        </div>

        {optimizedReports.length === 0 ? (
          <div className="no-reports-message">
            <p>🎯 No optimized reports loaded</p>
            <p>Add reports using the controls above to test the optimization features.</p>
          </div>
        ) : (
          <div className="reports-grid optimized">
            {optimizedReports.map((report) => (
              <div key={report.id} className={`report-card optimized ${report.priority}`}>
                <div className="report-header">
                  <h4>{report.name}</h4>
                  <div className="report-badges">
                    <span className={`priority-badge ${report.priority}`}>
                      {report.priority.toUpperCase()}
                    </span>
                    {report.lazyLoad && (
                      <span className="lazy-badge">LAZY</span>
                    )}
                  </div>
                  <button
                    className="remove-report-btn"
                    onClick={() => removeOptimizedReport(report.id)}
                    title="Remove Report"
                  >
                    ❌
                  </button>
                </div>
                
                <div className="report-info">
                  <p><strong>Workspace:</strong> {report.workspaceName}</p>
                  <p><strong>Priority:</strong> {report.priority}</p>
                  <p><strong>Lazy Load:</strong> {report.lazyLoad ? "Yes" : "No"}</p>
                  <p><strong>Added:</strong> {report.addedAt.toLocaleTimeString()}</p>
                </div>
                
                <div className="report-embed-container optimized">
                  <PowerBIErrorBoundary>
                    <EmbeddedPowerBIContainer
                      reportId={report.embedUrl.split("reportId=")[1]?.split("&")[0] || report.id}
                      embedUrl={report.embedUrl}
                      accessToken={report.accessToken}
                      onLoaded={handleReportLoaded(report.id)}
                      onError={handleReportError(report.id)}
                      height="300px"
                      priority={report.priority}
                      lazyLoad={report.lazyLoad}
                      maxConcurrentLoads={3}
                      resourceOptimization={{
                        disableAnimations: report.priority === 'low',
                        reduceQuality: report.priority === 'low',
                        limitRefreshRate: true
                      }}
                      className={`optimized-embed priority-${report.priority}`}
                      showLoadingState={true}
                    />
                  </PowerBIErrorBoundary>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optimization Features Info */}
      <div className="optimization-info">
        <h3>🔧 Optimization Features</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>🏗️ DOM Isolation</h4>
            <p>Each report uses complete DOM separation to prevent React/PowerBI conflicts</p>
          </div>
          <div className="info-card">
            <h4>📊 Multiple Reports</h4>
            <p>Load multiple instances of the same or different reports safely</p>
          </div>
          <div className="info-card">
            <h4>⚡ Priority System</h4>
            <p>Reports load based on priority: High, Normal, Low</p>
          </div>
          <div className="info-card">
            <h4>🔒 Stable Embedding</h4>
            <p>Uses the proven EmbeddedPowerBIContainer for reliable report loading</p>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="technical-details">
        <h3>🛠️ Technical Details</h3>
        <p>EmbeddedPowerBIContainer uses complete DOM detachment for stable multi-report embedding</p>
        <p>Performance metrics are tracked in real-time for debugging and optimization</p>
        <p>This approach prevents the "removeChild" DOM conflicts that can occur with complex embedding scenarios</p>
      </div>
    </div>
  );
}
