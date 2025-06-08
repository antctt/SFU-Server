class SpeakerIframeApi {
    static DEFAULT_OPTIONS = {
        room: 'default-room',
        roomPassword: false,
        name: 'guest',
        audio: false,
        video: false,
        screen: false,
        hide: false,
        notify: false,
        duration: 'unlimited',
        width: '100vw',
        height: '100vh',
        token: null,
        parentNode: null,
    };

    constructor(domain, options = {}) {
        if (!domain) {
            throw new Error('Domain is required');
        }

        this.domain = domain;
        this.options = { ...SpeakerIframeApi.DEFAULT_OPTIONS, ...options };

        if (!this.isValidParentNode()) {
            throw new Error('Invalid parent node provided');
        }

        this.init();
    }

    isValidParentNode() {
        return (
            this.options.parentNode &&
            this.options.parentNode instanceof HTMLElement &&
            typeof this.options.parentNode.appendChild === 'function'
        );
    }

    init() {
        const params = this.buildParams();
        const iframe = this.createIframe(params);
        this.options.parentNode.appendChild(iframe);
    }

    buildParams() {
        const params = new URLSearchParams({
            room: this.options.room,
            roomPassword: this.options.roomPassword,
            name: this.options.name,
            audio: this.options.audio ? 1 : 0,
            video: this.options.video ? 1 : 0,
            screen: this.options.screen ? 1 : 0,
            hide: this.options.hide ? 1 : 0,
            notify: this.options.notify ? 1 : 0,
            duration: this.options.duration,
        });

        if (this.options.token) {
            params.append('token', this.options.token);
        }

        return params;
    }

    createIframe(params) {
        const protocol = 'https';
        
        // SPEAKER ROOM: Use /speaker/roomName format (path param), not query params
        const roomName = encodeURIComponent(this.options.room);
        const baseUrl = `${protocol}://${this.domain}/speaker/${roomName}`;
        
        // Remove room from params since it's now in the path
        params.delete('room');
        
        // Construct final URL with remaining params as query string
        const url = new URL(baseUrl);
        if (params.toString()) {
            url.search = params.toString();
        }

        const iframe = document.createElement('iframe');
        iframe.src = url.toString();
        iframe.allow =
            'camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write; web-share; autoplay';
        iframe.style.width = this.options.width;
        iframe.style.height = this.options.height;
        iframe.style.border = '0px';

        // Optional: Add event listeners for loading and error states
        iframe.addEventListener('load', () => console.log('SpeakerRoom Iframe loaded successfully'));
        iframe.addEventListener('error', () => console.error('SpeakerRoom Iframe failed to load'));

        return iframe;
    }
} 