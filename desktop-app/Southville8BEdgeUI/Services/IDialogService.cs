using System.Collections.Generic;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.Services;

public interface IDialogService
{
    Task<bool> ConfirmDeleteAsync(string title, string message);
    Task ShowInfoAsync(string title, Dictionary<string, string> details);
    Task<bool> ShowConfirmAsync(string title, string message, string confirmText = "OK", string cancelText = "Cancel");
}
