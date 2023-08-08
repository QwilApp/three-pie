import { ApiCallError, InvalidAuthError } from "../../errors";

interface PathRequestParam {
  path: string;
  qs?: Record<string, string>;
  method: 'GET' | 'POST' | 'PATCH';
  headers?: object;
}

interface URLRequestParam {
  url: string;
  method: 'GET' | 'POST' | 'PATCH';
  headers?: object;
}

export abstract class MicrosoftBaseProvider {
  provider = 'microsoft';
  apiBaseUrl = 'https://graph.microsoft.com/v1.0';
  private authHeaders: object;

  constructor(token: string) {
    this.authHeaders = {Authorization: `Bearer ${token}`};
  }

  private async _requestUrl({url, method, headers}: URLRequestParam) {
    // cannot use plain object for header because we may need to set multiple "Prefer" headers
    const headerObj = new Headers({
      "Content-Type": "application/json;charset=utf-8",
      ...this.authHeaders,
      ...headers,
    })

    // Can't believe we need to explicitly ask for immutable ids...
    // https://learn.microsoft.com/en-us/graph/outlook-immutable-id
    // headerObj.append('Prefer', 'IdType="Immutable"');

    return fetch(url, {
      method,
      mode: "cors",
      headers: headerObj,
    }).then(async response => {
      const data = await response.json();
      if (response.status === 200) {
        return data;
      } else if (data.error.code === "InvalidAuthenticationToken") {
        throw new InvalidAuthError('Invalid token', response);
      } else {
        throw new ApiCallError(data?.error?.message || 'API call failed', response);
      }
    });
  }

  private async _requestPath({path, method, headers, qs}: PathRequestParam) {
    let pathSuffix = '';
    if (qs) {
      pathSuffix = '?' + new URLSearchParams(qs);
    }
    const url = `${this.apiBaseUrl}${path}${pathSuffix}`;
    return this._requestUrl({url, method, headers});
  }

  protected async request({path, method, headers, qs}: PathRequestParam) {
    return this._requestPath({path, method, headers, qs})
      .then(response => response.values);
  }

  protected async paginatedRequest({path, method, headers, qs}: PathRequestParam) {
    const out = [];
    let pageQuota = 5; // max pages we would paginate. Just to stop runaway queries
    let nextPageLink;
    let result;
    do {
      if (nextPageLink) {
        result = await this._requestUrl({url: nextPageLink, method, headers});
      } else {
        result = await this._requestPath({path, method, headers, qs})
      }
      // see https://learn.microsoft.com/en-us/graph/paging
      nextPageLink = result['@odata.nextLink'];
      out.push(...result.values);
      pageQuota--;
      if (nextPageLink && !pageQuota) {
        console.error('Query has too many pages. Truncating calls.')
      }
    } while (nextPageLink && pageQuota);

    return out;
  }
}