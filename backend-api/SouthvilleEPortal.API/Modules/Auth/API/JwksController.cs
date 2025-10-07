using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SouthvilleEPortal.API.Shared.Security;

namespace SouthvilleEPortal.API.Modules.Auth.API;

[ApiController]
[Route(".well-known/jwks.json")]
public class JwksController : ControllerBase
{
    private readonly IJwtKeyRing _keyRing;
    public JwksController(IJwtKeyRing keyRing) => _keyRing = keyRing;

    [HttpGet]
    [ResponseCache(Duration = 300)]
    public IActionResult Get()
    {
        var keys = _keyRing.GetAllKeys().Select(k => new
        {
            kty = "RSA",
            use = "sig",
            kid = k.KeyId,
            alg = "RS256",
            n = Base64UrlEncoder.Encode(k.Rsa.ExportParameters(false).Modulus!),
            e = Base64UrlEncoder.Encode(k.Rsa.ExportParameters(false).Exponent!)
        });
        return Ok(new { keys });
    }
}
