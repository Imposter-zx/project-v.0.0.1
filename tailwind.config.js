module.exports = {
    content: [
        "./index.html",
        "./frontend/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9f1',
                    100: '#dcf1df',
                    200: '#bbe3c3',
                    300: '#8fce9d',
                    400: '#5fb172',
                    500: '#3d9451',
                    600: '#2e773f',
                    700: '#265f35',
                    800: '#214c2d',
                    900: '#1c3f27',
                },
                energy: {
                    low: '#22c55e',
                    medium: '#eab308',
                    high: '#ef4444',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
