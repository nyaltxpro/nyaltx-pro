const config = {
  plugins: {
    '@tailwindcss/postcss': {
      // Let Next.js own CSS minify — double minify causes HookWebpackError
      optimize: { minify: false },
    },
  },
};

export default config;
