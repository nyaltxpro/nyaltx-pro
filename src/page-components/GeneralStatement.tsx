'use client';

import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiShield } from "react-icons/fi";
import { useTina } from "tinacms/dist/react";
import type { GeneralStatementQuery } from "../../tina/__generated__/types";

export default function GeneralStatementClient(props: { data: GeneralStatementQuery; variables: object; query: string }) {
    const { data } = useTina<GeneralStatementQuery>(props);
    const page = data.generalStatement;


    return (
        <div className="min-h-screen bg-inherit text-white">
            <PublicHeader />

            {/* Hero */}
            <section className="container mx-auto px-4 pt-16 pb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-start gap-4"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
                        <FiShield className="h-4 w-4 text-cyan-300" />
                        <span>{page.tagline}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                        {page.title}
                    </h1>
                    <p className="max-w-3xl text-white/70">{page.description}</p>
                </motion.div>
            </section>

            {/* Sections */}
            <section className="container mx-auto px-4 pb-20">
                {page?.sections?.map((sec: any, i: any) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-10"
                    >
                        {sec?.icon === "alert" && <FiAlertTriangle className="h-5 w-5 text-amber-300 mb-3" />}
                        <h2 className="text-2xl font-semibold mb-4">{sec?.heading}</h2>

                        {sec?.subsections?.map((sub: any, j: any) => (
                            <div key={j} className="mb-6">
                                <h3 className="text-xl font-semibold mb-2">{sub?.title}</h3>
                                <p className="text-white/80 leading-relaxed whitespace-pre-line">{sub?.content}</p>
                            </div>
                        ))}

                        {sec?.content && <p className="text-white/80 whitespace-pre-line">{sec.content}</p>}
                        {sec?.list && (
                            <ol className="list-decimal pl-6 mt-3 space-y-2 text-white/80">
                                {sec?.list.map((item: any, idx: any) => <li key={idx}>{item}</li>)}
                            </ol>
                        )}
                    </motion.div>
                ))}
            </section>
        </div>
    );
}
