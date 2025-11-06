using Microsoft.AspNetCore.Mvc;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        /// <summary>
        /// Ultra simple test endpoint
        /// </summary>
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok(new { 
                status = "OK", 
                message = "Test controller is working",
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Even simpler test
        /// </summary>
        [HttpGet("hello")]
        public string Hello()
        {
            return "Hello World from TestController";
        }

        /// <summary>
        /// Test with JSON response
        /// </summary>
        [HttpGet("json")]
        public IActionResult TestJson()
        {
            return Ok(new { 
                success = true,
                data = "JSON response working",
                controller = "TestController"
            });
        }
    }
}