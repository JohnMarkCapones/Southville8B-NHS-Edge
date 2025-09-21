using System.Threading.Tasks;

namespace Southville8BEdgeUI.Services;

public interface IDialogService
{
    Task<bool> ConfirmDeleteAsync(string title, string message);
}
