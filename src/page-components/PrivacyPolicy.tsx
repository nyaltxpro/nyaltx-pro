'use client';

import Header from '@/components/Header';
import { useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface PrivacyPolicyProps {
    tinaData: any;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ tinaData }) => {
    const { data }: any = useTina(tinaData);

    const pageData = (data?.privacyPolicy ?? data) || {};
    const hero = pageData.hero;
    const heroStyle = hero?.backgroundImage
        ? {
              backgroundImage: `url(${hero.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }
        : undefined;

    return (
        <div>
            <Header />
            {hero ? (
                <section className="hero-section p-12 text-center text-white" style={heroStyle}>
                    <h1 className="text-4xl font-bold">{hero.title}</h1>
                    <p className="mt-4 text-lg">{hero.subtitle}</p>
                </section>
            ) : null}

            <section className="content-section max-w-4xl mx-auto p-8">
                <TinaMarkdown content={pageData.content} />
            </section>
        </div>
    );
};

export default PrivacyPolicy;
