// ============================================================
// Transport same-origin (fetch) + CSRF — analog 'transport'/'Store.api'
// pada hris-adsy. Token CSRF dikirim lewat header X-XSRF-TOKEN yang dibaca
// dari cookie XSRF-TOKEN (pola yang sama dipakai axios di Laravel).
// ============================================================

export async function api(path, { method = 'GET', body } = {}) {
    const res = await fetch('/api' + path, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': cookie('XSRF-TOKEN'),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        const err = new Error(json.message || res.statusText || 'Something went wrong');
        err.status = res.status;
        throw err;
    }

    return json.data ?? {};
}

function cookie(name) {
    const esc = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
    const m = document.cookie.match(new RegExp('(^|; )' + esc + '=([^;]*)'));
    return m ? decodeURIComponent(m[2]) : '';
}