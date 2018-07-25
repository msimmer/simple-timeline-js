module.exports = ({env}) => ({
    parser: 'sugarss',
    plugins: [
        require('postcss-nesting'),
        require('postcss-css-variables'),
        require('postcss-custom-media'),
        require('postcss-calc'),
        (env === 'production' && require('cssnano')),
    ]
})
