namespace backend.Services
{
    public interface IBookRecommendationService
    {
        Task<string> GenerateResponse(string message);
    }
}