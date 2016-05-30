var templates = {

    layoutHeader: {
        source: 'assets/layout/header.html',
        dest: 'assets/layout/header.html'
    },
    layoutFooter: {
        source: 'assets/layout/footer.html',
        dest: 'assets/layout/footer.html'
    },
    cssApp: {
        source: 'assets/css/app.css',
        dest: 'assets/css/app.css'
    },
    cssReset: {
        source: 'assets/css/reset.css',
        dest: 'assets/css/reset.css'
    },
    cssPublic: {
        source: 'assets/css/public.css',
        dest: 'assets/css/public.css'
    },
    cssAnimate: {
        source: 'assets/css/animate.css',
        dest: 'assets/css/animate.css'
    },
    cssFonts: {
        source: 'assets/css/fonts.css',
        dest: 'assets/css/fonts.css'
    },
    cssMedia: {
        source: 'assets/css/media.css',
        dest: 'assets/css/media.css'
    },

    //mockData
    mockData: {
        source: 'assets/mockData/login.json',
        dest: 'assets/mockData/login.json'
    },

    //components
    legalSeletorHtml: {
        source: 'assets/components/legalSelector/index.html',
        dest: 'assets/components/legalSelector/index.html'
    },
    legalSeletorStyle: {
        source: 'assets/components/legalSelector/style.css',
        dest: 'assets/components/legalSelector/style.css'
    },
    legalSeletorScript: {
        source: 'assets/components/legalSelector/index.js',
        dest: 'assets/components/legalSelector/index.js'
    },

    moduleConfig: {
        source: 'modules/config.js',
        dest: 'modules/config.js'
    },
    moduleModel: {
        source: 'modules/model.js',
        dest: 'modules/model.js'
    },
    moduleView: {
        source: 'modules/view.js',
        dest: 'modules/view.js'
    },

    imageLoading: {
        source: 'assets/images/loading.gif',
        dest: 'assets/images/loading.gif'
    },

    font1: {
        source: 'assets/fonts/icomoon.eot',
        dest: 'assets/fonts/icomoon.eot'
    },
    font2: {
        source: 'assets/fonts/icomoon.svg',
        dest: 'assets/fonts/icomoon.svg'
    },
    font3: {
        source: 'assets/fonts/icomoon.ttf',
        dest: 'assets/fonts/icomoon.ttf'
    },
    font4: {
        source: 'assets/fonts/icomoon.woff',
        dest: 'assets/fonts/icomoon.woff'
    },

    indexHtml: {
        source: 'views/index.html',
        dest: 'views/index.html'
    },
    loginHtml: {
        source: 'views/login.html',
        dest: 'views/login.html'
    },

    loginJS: {
        source: 'modules/passport/loginView.js',
        dest: 'modules/passport/loginView.js'
    }

};

module.exports = templates;