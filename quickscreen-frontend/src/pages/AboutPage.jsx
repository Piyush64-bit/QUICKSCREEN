import React from 'react';
import Card from '../components/ui/Card';

const AboutPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-6 py-32">
            <h1 className="text-5xl font-bold mb-12 tracking-tight text-white">About</h1>
            
            <div className="grid gap-12 text-gray-400 leading-relaxed text-lg font-light">
                <section>
                    <p className="mb-6">
                        Quick Screen was built with a single mission: <span className="text-white font-normal">to make screen sharing as effortless as possible.</span>
                    </p>
                    <p>
                        In a world of bloated video conferencing software, we wanted a tool that does one thing and does it perfectly.
                        We stripped away the sign-ups, the installs, and the complexity.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-8">
                        <strong className="text-white block mb-3 text-xl font-medium">Privacy Centric</strong>
                        <p className="text-sm text-gray-500">
                            We believe your data belongs to you. Quick Screen utilizes WebRTC for direct P2P connections. 
                            Your video stream never touches our servers.
                        </p>
                    </Card>
                    <Card className="p-8">
                        <strong className="text-white block mb-3 text-xl font-medium">Open Source</strong>
                        <p className="text-sm text-gray-500">
                            Transparency builds trust. You can inspect our code, contribute, or host it yourself.
                            Community-driven development is at our core.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
