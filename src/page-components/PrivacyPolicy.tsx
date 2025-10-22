'use client';

import Header from '@/components/Header';
import { useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface PrivacyPolicyProps {
    tinaData: any;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ tinaData }) => {
    const { data }: any = useTina(tinaData);

    return (
        <div>
            <Header />
            <section
                className="hero-section p-12 text-center text-white"
                style={{
                    backgroundImage: `url(${data.hero.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <h1 className="text-4xl font-bold">{data.hero.title}</h1>
                <p className="mt-4 text-lg">{data.hero.subtitle}</p>
            </section>

            <section className="content-section max-w-4xl mx-auto p-8">
                <TinaMarkdown content={data.content} />
            </section>
        </div>
    );
};

export default PrivacyPolicy;
