
class Base64 {
    static encode(utf8) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    static decode(encoded) {
        return decodeURIComponent(escape(atob(encoded)));
    }
}

