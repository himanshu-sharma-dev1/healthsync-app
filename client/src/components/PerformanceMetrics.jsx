import { useState, useEffect } from 'react';
import './PerformanceMetrics.css';

const PerformanceMetrics = () => {
    const [metrics, setMetrics] = useState({
        pageLoadTime: 0,
        apiResponseTime: 0,
        videoQuality: 'HD',
        networkLatency: 0,
        memoryUsage: 0
    });

    const [isVisible, setIsVisible] = useState(false);

    // Calculate metrics on mount
    useEffect(() => {
        calculateMetrics();

        // Update metrics periodically
        const interval = setInterval(calculateMetrics, 5000);
        return () => clearInterval(interval);
    }, []);

    const calculateMetrics = () => {
        // Page load time from Performance API
        const navigation = performance.getEntriesByType('navigation')[0];
        const pageLoad = navigation ? Math.round(navigation.loadEventEnd - navigation.startTime) : 0;

        // Simulated metrics for demo
        const apiResponse = Math.round(100 + Math.random() * 200); // 100-300ms
        const latency = Math.round(20 + Math.random() * 80); // 20-100ms
        const memory = performance.memory
            ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024))
            : Math.round(50 + Math.random() * 50);

        // Video quality based on connection
        const connection = navigator.connection;
        let videoQuality = 'HD';
        if (connection) {
            if (connection.effectiveType === '4g') videoQuality = 'HD';
            else if (connection.effectiveType === '3g') videoQuality = 'SD';
            else videoQuality = 'Low';
        }

        setMetrics({
            pageLoadTime: pageLoad || Math.round(800 + Math.random() * 400),
            apiResponseTime: apiResponse,
            videoQuality,
            networkLatency: latency,
            memoryUsage: memory
        });
    };

    const getStatusColor = (value, thresholds) => {
        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.fair) return 'fair';
        return 'poor';
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                className="metrics-toggle"
                onClick={() => setIsVisible(!isVisible)}
                title="Performance Metrics"
            >
                📊
            </button>

            {/* Metrics Panel */}
            {isVisible && (
                <div className="metrics-panel">
                    <div className="panel-header">
                        <h4>📊 Performance</h4>
                        <button onClick={() => setIsVisible(false)}>×</button>
                    </div>

                    <div className="metrics-list">
                        {/* Page Load */}
                        <div className="metric-item">
                            <div className="metric-label">
                                <span className="metric-icon">⏱️</span>
                                Page Load
                            </div>
                            <div className={`metric-value ${getStatusColor(metrics.pageLoadTime, { good: 1000, fair: 2000 })}`}>
                                {metrics.pageLoadTime}ms
                            </div>
                        </div>

                        {/* API Response */}
                        <div className="metric-item">
                            <div className="metric-label">
                                <span className="metric-icon">🔗</span>
                                API Response
                            </div>
                            <div className={`metric-value ${getStatusColor(metrics.apiResponseTime, { good: 200, fair: 500 })}`}>
                                {metrics.apiResponseTime}ms
                            </div>
                        </div>

                        {/* Network Latency */}
                        <div className="metric-item">
                            <div className="metric-label">
                                <span className="metric-icon">📡</span>
                                Latency
                            </div>
                            <div className={`metric-value ${getStatusColor(metrics.networkLatency, { good: 50, fair: 100 })}`}>
                                {metrics.networkLatency}ms
                            </div>
                        </div>

                        {/* Video Quality */}
                        <div className="metric-item">
                            <div className="metric-label">
                                <span className="metric-icon">🎥</span>
                                Video Quality
                            </div>
                            <div className={`metric-value ${metrics.videoQuality === 'HD' ? 'good' : metrics.videoQuality === 'SD' ? 'fair' : 'poor'}`}>
                                {metrics.videoQuality}
                            </div>
                        </div>

                        {/* Memory */}
                        <div className="metric-item">
                            <div className="metric-label">
                                <span className="metric-icon">💾</span>
                                Memory
                            </div>
                            <div className={`metric-value ${getStatusColor(metrics.memoryUsage, { good: 100, fair: 200 })}`}>
                                {metrics.memoryUsage}MB
                            </div>
                        </div>
                    </div>

                    <div className="metrics-footer">
                        <button onClick={calculateMetrics} className="refresh-btn">
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PerformanceMetrics;
