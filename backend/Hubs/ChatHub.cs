using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using backend.Services;

namespace backend.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IBookRecommendationService _recommendationService;

        public ChatHub(IBookRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        public async Task SendMessage(string user, string message)
        {
            // Forward user message to all clients
            await Clients.All.SendAsync("ReceiveMessage", user, message, false);

            // Generate bot response
            var botResponse = await _recommendationService.GenerateResponse(message);

            // Send bot response after short delay (feels more natural)
            await Task.Delay(800);
            await Clients.Caller.SendAsync("ReceiveMessage", "BookBot", botResponse, true);
        }
    }
}