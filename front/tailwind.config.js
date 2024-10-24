/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dourado: "#463714",
        fundopreto: "#02070f",
        azul: "#E84057",
        vermelho: "#5383E8",
        vermelhomaisescuro: "#59343b",
        azulmaisescuro: "#28344e",
      },
      backgroundImage: {
        "fundo-login": "url('/fundologin.png')",
        "fundo-historico": "url('/fundohistorico.png')",
        "fundo-perfil": "url('/fundoperfil.png')",
        "fundo-bandeira": "url('/bandeira.png')",
      },
    },
  },
  plugins: [],
};
