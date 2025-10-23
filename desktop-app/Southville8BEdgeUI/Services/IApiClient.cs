using System;
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.Services;

public interface IApiClient
{
    Task<T?> GetAsync<T>(string endpoint) where T : class;
    Task<T?> PostAsync<T>(string endpoint, object? data = null) where T : class;
    Task<T?> PutAsync<T>(string endpoint, object? data = null) where T : class;
    Task<T?> DeleteAsync<T>(string endpoint) where T : class;
    Task<bool> PostAsync(string endpoint, object? data = null);
    Task<bool> PutAsync(string endpoint, object? data = null);
    Task<bool> DeleteAsync(string endpoint);
}
