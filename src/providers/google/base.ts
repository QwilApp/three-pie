import { ApiCallError, InvalidAuthError } from "../../errors";

interface RequestParam {
  path: string;
  method: 'GET' | 'POST' | 'PATCH';
  qs?: Record<string, string>;
}

export abstract class GoogleBaseProvider {
  provider = "google";
  abstract apiBaseUrl: string;
  private authHeaders: object;

  constructor(token: string) {
    this.authHeaders = {Authorization: `Bearer ${token}`};
  }

  private async _request({path, method, qs}: RequestParam) {
    let pathSuffix = '';
    if (qs) {
      pathSuffix = '?' + new URLSearchParams(qs);
    }

    return fetch(`${this.apiBaseUrl}${path}${pathSuffix}`, {
      method,
      mode: "cors",
      headers: {...this.authHeaders},
    }).then(async response => {
      const data = await response.json();

      if (response.status === 200) {
        return data;
      } else if (data.error.status === "UNAUTHENTICATED") {
        throw new InvalidAuthError('Invalid token', response);
      } else {
        throw new ApiCallError(data?.error?.message || 'API call failed', response);
      }
    })
  }

  protected async request({path, method, qs}: RequestParam) {
    return this._request({path, method, qs})
      .then(response => response.items);
  }

  protected async paginatedRequest({path, method, qs}: RequestParam, pageSize?: number) {
    const out = [];
    let pageQuota = 5; // max pages we would paginate. Just to stop runaway queries
    let nextPageToken;
    do {
      const requestQs = {
        ...qs,
        ...(pageSize ? {pageSize: pageSize.toString()} as Record<string, string> : null),
        ...(nextPageToken ? {nextPageToken} as Record<string, string> : null),
      }
      const result = await this._request({path, method, qs: requestQs})
      out.push(...result.items);
      nextPageToken = result.nextPageToken;
      pageQuota--;
      if (nextPageToken && !pageQuota) {
        console.error('Query has too many pages. Truncating calls.')
      }
    } while (nextPageToken && pageQuota);

    return out;
  }
}