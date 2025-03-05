using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace backend.Constants
{
    public static class SeederConstants
    {
        private static readonly Random random = new Random();

        // Word pools - removed words starting with vowels to avoid "a"/"an" grammar issues
        public static readonly List<string> Adjectives = new List<string>
        {
            "mysterious", "thrilling", "captivating", "haunting", "brilliant",
            "thoughtful", "hilarious", "heartbreaking", "riveting", "breathtaking",
            "whimsical", "terrifying", "delightful", "peculiar", "magical",
            "puzzling", "refreshing", "chilling", "bizarre", "disturbing",
            "profound", "compelling", "dazzling", "gripping", "stunning",
            "perplexing", "majestic", "bewildering", "sassy", "zealous", "vibrant"
        };

        public static readonly List<string> Nouns = new List<string>
        {
            "secret", "journey", "mystery", "tale", "legacy", "chronicles",
            "symphony", "quest", "prophecy", "legend", "conspiracy", "plan",
            "destiny", "riddle", "paradox", "revelation", "saga", "phenomenon",
            "kingdom", "dimension", "world", "reality", "future", "past",
            "potato", "doorknob", "sandal", "pickle", "hammer", "spatula", "lighthouse"
        };

        public static readonly List<string> BookSubjects = new List<string>
        {
            "love", "time", "death", "life", "history", "space", "magic",
            "technology", "war", "peace", "rebellion", "discovery", "transformation",
            "betrayal", "redemption", "survival", "justice", "revenge", "forgiveness",
            "power", "freedom", "wealth", "knowledge", "wisdom", "danger",
            "cheese", "disco", "toast", "bagpipes", "zombies", "dragons", "politics"
        };

        public static readonly List<string> Characters = new List<string>
        {
            "detective", "wizard", "vampire", "scientist", "chef", "doctor",
            "soldier", "queen", "pilot", "spy", "librarian", "robot",
            "ghost", "teacher", "journalist", "hacker", "pirate", "ninja", "superhero",
            "mercenary", "prince", "princess", "barista", "plumber", "villain", "mime"
        };

        public static readonly List<string> Settings = new List<string>
        {
            "castle", "futuristic city", "haunted mansion", "remote island", "space station",
            "hidden kingdom", "desert", "mountain village", "parallel world",
            "virtual reality", "wasteland", "magical forest", "secret laboratory",
            "medieval town", "dystopian future", "forgotten realm",
            "grocery store", "waiting room", "cat café", "furniture warehouse"
        };

        public static readonly List<string> Plots = new List<string>
        {
            "seeking revenge against their nemesis", "uncovering a global conspiracy",
            "solving a mysterious murder", "searching for a legendary treasure",
            "escaping a dangerous pursuit", "mastering a powerful skill",
            "uniting warring factions", "surviving against impossible odds",
            "mapping uncharted territories", "overthrowing a tyrannical ruler",
            "preventing a disaster", "finding their way back home",
            "reconciling with their past", "protecting a dangerous secret",
            "teaching their pet to speak French", "finding matching socks",
            "planning the perfect dinner party during an alien invasion"
        };

        // Book title templates - grammar-safe
        public static readonly List<string> BookTitleTemplates = new List<string>
        {
            "The {Adjective} {Noun}",
            "{Noun} of {BookSubject}",
            "The Last {Character}",
            "{Character}'s {Noun}",
            "The {Adjective} {Character}",
            "{Adjective} {BookSubject}",
            "The {Setting} {Noun}",
            "{BookSubject} and {BookSubject}",
            "The {Noun} of the {Character}",
            "{Number} {Nouns}",
            "The {Character} and the {Noun}",
            "The {Adjective} {Setting}",
            "{BookSubject} in the {Setting}",
            "How to {Plot} in 10 Days",
            "My Life as a {Character}"
        };

        // Book description templates - fixed to use "the" instead of "a/an" before placeholders
        public static readonly List<string> BookDescriptionTemplates = new List<string>
        {
            "In the {Adjective} {Setting}, the {Character} discovers the {Adjective} {Noun} that changes everything. What follows is the {Adjective} tale of {BookSubject} and {BookSubject}, as our protagonist embarks on a journey {Plot}.",

            "The {Adjective} story of the {Character} {Plot} in the {Setting}. This {Adjective} book explores themes of {BookSubject} and {BookSubject} in a way that will leave readers spellbound.",

            "When the {Character} encounters the {Adjective} {Noun}, nothing is ever the same again. Set in the {Setting}, this {Adjective} narrative follows the protagonist's quest for {BookSubject} while {Plot}.",

            "The {Adjective} tale of the {Character} who must overcome {BookSubject} and {BookSubject} while {Plot}. Set against the backdrop of the {Setting}, this story will keep readers captivated until the very last page.",

            "The {Character} finds themselves in the {Adjective} situation when they discover the {Noun} with the power to change their {Setting} forever. What unfolds is the {Adjective} exploration of {BookSubject} as the protagonist faces the challenge of {Plot}."
        };

        // Reviews by rating - fixed to avoid a/an grammar issues
        public static readonly Dictionary<int, List<string>> ReviewTemplatesByRating = new Dictionary<int, List<string>>
        {
            // 1-star reviews
            { 1, new List<string>
                {
                    "I couldn't even finish this {Adjective} book. The {Character} was completely {Adjective}, and the plot about {Plot} made absolutely no sense. The {Setting} setting was {Adjective} at best. I want my money back!",

                    "This has to be the worst book about {BookSubject} I've ever read. The {Character} was so {Adjective} that I couldn't relate at all. The author clearly knows nothing about {Plot}. Complete waste of time!",

                    "I've read cereal boxes with better plots than this {Adjective} disaster. The {Character} made decisions that no real person would make, and the {Setting} setting was described so poorly I couldn't picture it. How did this even get published?",

                    "Terrible. Just terrible. The {Adjective} writing style was painful to read, the {Character} had the personality of a cardboard box, and the storyline about {Plot} was full of plot holes. I'm actually angry I spent time on this.",

                    "Avoid at all costs! This book about {BookSubject} was so {Adjective} that I nearly fell asleep. The {Character} was totally unrealistic, and the {Adjective} dialogue made me cringe. One star is actually too generous."
                }
            },
            
            // 2-star reviews
            { 2, new List<string>
                {
                    "This book had potential with its {Setting} setting, but the {Adjective} {Character} ruined it for me. The concept of {Plot} could have been interesting if executed better. Unfortunately, it fell flat about halfway through.",

                    "I was excited about a story featuring {BookSubject}, but this was disappointing. The {Character} was somewhat {Adjective}, but the plot was predictable. The {Adjective} writing style didn't help either.",

                    "Not the worst I've read, but close. The {Setting} was actually well-described, but the {Character} was so {Adjective} that I couldn't root for them. The theme of {BookSubject} deserved better treatment.",

                    "Started strong with an interesting premise about {Plot}, but quickly became {Adjective} and boring. The {Character} had no real development, and the ending was unsatisfying. Could've been much better.",

                    "I'm giving this two stars only because the {Setting} setting was somewhat original. Otherwise, the {Adjective} storyline about {BookSubject} was a mess, and the {Character} made me roll my eyes constantly."
                }
            },
            
            // 3-star reviews
            { 3, new List<string>
                {
                    "A decent read overall. The {Character} was reasonably {Adjective}, and I enjoyed the {Setting} setting. The story about {Plot} had some good moments, though it dragged in places. Not amazing, but not terrible either.",

                    "Middle of the road. The author's take on {BookSubject} was interesting, and the {Character} had some {Adjective} moments. However, the storyline about {Plot} felt uneven. Worth a read if you have nothing else in your queue.",

                    "This book was just okay. The {Setting} was described well, and the theme of {BookSubject} was handled competently. The {Character} could have been more {Adjective}, but I still finished the book, so that says something.",

                    "Three stars for an average reading experience. The {Adjective} writing style was fine, and the story about {Plot} had its moments. The {Character} was relatable enough, but nothing about this book will stick with me.",

                    "Neither great nor terrible. The {Setting} setting was a nice backdrop for the story about {BookSubject}. The {Character} was somewhat {Adjective}, which helped me get through the more predictable parts about {Plot}."
                }
            },
            
            // 4-star reviews
            { 4, new List<string>
                {
                    "I really enjoyed this book! The {Character} was wonderfully {Adjective}, and the story about {Plot} kept me turning pages. The {Setting} setting was vividly portrayed. Would definitely recommend, with just a few minor issues.",

                    "A great read that I couldn't put down. The author's exploration of {BookSubject} was thought-provoking, and the {Character} was both {Adjective} and relatable. The {Setting} came alive in my imagination. Highly recommended!",

                    "Four stars for this engaging story! The {Adjective} writing pulled me in, and the {Character}'s journey through the {Setting} was captivating. The theme of {BookSubject} was handled with nuance. Just short of perfect.",

                    "I was pleasantly surprised by this book. The plot involving {Plot} was well-constructed, and the {Character} was wonderfully {Adjective}. The author's description of the {Setting} made me feel like I was there. Very good read!",

                    "This book exceeded my expectations! The {Adjective} narrative about {BookSubject} was compelling, and the {Character} had real depth. I particularly enjoyed how the author brought the {Setting} to life. Will read more from this author."
                }
            },
            
            // 5-star reviews
            { 5, new List<string>
                {
                    "Absolutely brilliant! The {Character} was incredibly {Adjective}, and the storyline about {Plot} was masterfully crafted. The {Setting} setting was so immersive I lost track of time. One of the best books I've ever read!",

                    "A true masterpiece! The author's exploration of {BookSubject} was profound, and the {Character} will stay with me for a long time. The {Adjective} narrative set in the {Setting} was nothing short of genius. Couldn't put it down!",

                    "Five stars isn't enough for this incredible book! The {Character}'s journey through {Plot} was emotionally powerful, and the {Setting} was described so vividly I felt I was there. A perfect blend of {BookSubject} and {BookSubject}.",

                    "I'm still reeling from this amazing read! The {Adjective} {Character} was one of the most compelling protagonists I've encountered, and the story about {Plot} kept me on the edge of my seat. The {Setting} was the perfect backdrop. A must-read!",

                    "This book changed my perspective on {BookSubject}! The {Adjective} writing style was beautiful, and the {Character}'s arc was perfectly executed. The {Setting} setting added depth to the already powerful narrative about {Plot}. Absolutely perfect!"
                }
            }
        };

        // Helper methods
        public static T GetRandomItem<T>(List<T> list)
        {
            return list[random.Next(list.Count)];
        }

        public static int GetRandomNumber(int min, int max)
        {
            return random.Next(min, max + 1);
        }
    }
}