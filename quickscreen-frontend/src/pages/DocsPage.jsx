import React from 'react';
import Card from '../components/ui/Card';

const DocsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-32">
      <h1 className="text-5xl font-bold mb-4 tracking-tight text-white">Documentation</h1>
      <p className="text-xl text-gray-500 font-light mb-16">Everything you need to know about using Quick Screen.</p>
      
      <div className="space-y-16">
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-primary"></div>
            <h2 className="text-2xl font-semibold text-white">Getting Started</h2>
          </div>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Quick Screen requires no installation. It works directly in any modern web browser that supports WebRTC.
            The peer-to-peer nature means low latency and high quality.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['Chrome', 'Firefox', 'Safari', 'Edge'].map(browser => (
                <div key={browser} className="p-4 rounded-xl bg-surface border border-white/5 text-center text-sm text-gray-400">
                    {browser}
                </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-primary"></div>
            <h2 className="text-2xl font-semibold text-white">Troubleshooting</h2>
          </div>
          
          <Card className="p-8 border-l-4 border-l-primary/50">
            <h3 className="font-semibold text-white mb-2 text-lg">Screen share permission denied</h3>
            <p className="text-gray-400 font-light">
                Modern operating systems require explicit permission to record the screen. 
                <br /><br />
                <strong>On macOS:</strong> Go to System Preferences &gt; Security & Privacy &gt; Screen Recording and ensure your browser is checked. You may need to restart the browser.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default DocsPage;
