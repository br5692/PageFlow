using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace backend.Constants
{
    public static class SeederConstants
    {
        private static readonly Random random = new Random();

        // Expanded adjectives for more descriptive variety
        public static readonly List<string> Adjectives = new List<string>
        {
            // Original adjectives
            "mysterious", "thrilling", "captivating", "haunting", "brilliant",
            "thoughtful", "hilarious", "heartbreaking", "riveting", "breathtaking",
            "whimsical", "terrifying", "delightful", "peculiar", "magical",
            "puzzling", "refreshing", "chilling", "bizarre", "disturbing",
            "profound", "compelling", "dazzling", "gripping", "stunning",
            "perplexing", "majestic", "bewildering", "sassy", "zealous", "vibrant",
            
            // New adjectives for more variety
            "mesmerizing", "poignant", "twisted", "nostalgic", "ethereal",
            "chaotic", "bittersweet", "methodical", "surreal", "eccentric",
            "melancholy", "suspenseful", "dynamic", "mischievous", "cryptic",
            "hypnotic", "scenic", "turbulent", "tender", "intimate",
            "startling", "vivid", "gritty", "lyrical", "provocative",
            "savage", "relentless", "sophisticated", "witty", "haunted"
        };

        // Expanded nouns for more thematic variety
        public static readonly List<string> Nouns = new List<string>
        {
            // Original nouns
            "secret", "journey", "mystery", "tale", "legacy", "chronicles",
            "symphony", "quest", "prophecy", "legend", "conspiracy", "plan",
            "destiny", "riddle", "paradox", "revelation", "saga", "phenomenon",
            "kingdom", "dimension", "world", "reality", "future", "past",
            "potato", "doorknob", "sandal", "pickle", "hammer", "spatula", "lighthouse",
            
            // New nouns
            "cipher", "labyrinth", "serenade", "masquerade", "tempest",
            "mirage", "courtyard", "compass", "prism", "veil",
            "relic", "tapestry", "citadel", "portrait", "dagger",
            "garden", "sonnet", "memoir", "castle", "fortress",
            "manifesto", "treaty", "diary", "mirror", "shadow",
            "temple", "cathedral", "threshold", "key", "pendant"
        };

        // Expanded book subjects for more thematic depth
        public static readonly List<string> BookSubjects = new List<string>
        {
            "Fiction", "Fantasy", "Science Fiction", "Mystery", "Thriller",
            "Horror", "Romance", "Historical Fiction", "Literary Fiction",
            "Non-Fiction", "Biography", "Autobiography", "History", "Science",
            "Mathematics", "Computer Science", "Technology", "Philosophy",
            "Psychology", "Self-Help", "Business", "Economics", "Politics",
            "Travel", "Cookbooks", "Art", "Music", "Religion", "Spirituality",
            "True Crime", "Poetry", "Drama", "Classics", "Young Adult", "Children's"
        };

        // Expanded characters for more diverse protagonists
        public static readonly List<string> Characters = new List<string>
        {
            // Original characters
            "detective", "wizard", "vampire", "scientist", "chef", "doctor",
            "soldier", "queen", "pilot", "spy", "librarian", "robot",
            "ghost", "teacher", "journalist", "hacker", "pirate", "ninja", "superhero",
            "mercenary", "prince", "princess", "barista", "plumber", "villain", "mime",
            
            // New characters
            "alchemist", "archer", "astronaut", "bard", "bounty hunter",
            "clockmaker", "diplomat", "druid", "explorer", "fortune teller",
            "gladiator", "guardian", "healer", "illusionist", "inventor",
            "knight", "mapmaker", "merchant", "monk", "nomad",
            "oracle", "outlaw", "priest", "refugee", "scholar",
            "scribe", "shaman", "thief", "time traveler", "wanderer"
        };

        // Expanded settings for more varied world-building
        public static readonly List<string> Settings = new List<string>
        {
            // Original settings
            "castle", "futuristic city", "haunted mansion", "remote island", "space station",
            "hidden kingdom", "desert", "mountain village", "parallel world",
            "virtual reality", "wasteland", "magical forest", "secret laboratory",
            "medieval town", "dystopian future", "forgotten realm",
            "grocery store", "waiting room", "cat café", "furniture warehouse",
            
            // New settings
            "underwater kingdom", "floating islands", "ancient library", "abandoned mine",
            "crystalline cave", "clockwork tower", "steampunk airship", "subterranean city",
            "enchanted garden", "volcanic archipelago", "frozen tundra", "celestial observatory",
            "orbital habitat", "sprawling metropolis", "crumbling monastery", "sunken temple",
            "sentient forest", "nomadic caravan", "shifting maze", "quantum realm",
            "endless labyrinth", "pocket dimension", "ancient ruins", "neon-lit slums",
            "moonlit harbor", "forgotten battlefield", "misty valley", "crystallized ocean"
        };

        // Expanded plots for more varied storylines
        public static readonly List<string> Plots = new List<string>
        {
            // Original plots
            "seeking revenge against their nemesis", "uncovering a global conspiracy",
            "solving a mysterious murder", "searching for a legendary treasure",
            "escaping a dangerous pursuit", "mastering a powerful skill",
            "uniting warring factions", "surviving against impossible odds",
            "mapping uncharted territories", "overthrowing a tyrannical ruler",
            "preventing a disaster", "finding their way back home",
            "reconciling with their past", "protecting a dangerous secret",
            "teaching their pet to speak French", "finding matching socks",
            "planning the perfect dinner party during an alien invasion",
            
            // New plots
            "deciphering an ancient prophecy", "breaking a family curse",
            "traveling through time to fix a mistake", "restoring balance to a failing ecosystem",
            "infiltrating a secret society", "exposing a corrupt government",
            "rebuilding a fallen civilization", "developing a revolutionary invention",
            "navigating a labyrinth of political intrigue", "solving an impossible mathematical theorem",
            "retrieving a stolen artifact", "communicating with an alien species",
            "unlocking the secrets of their own mind", "embarking on a spiritual journey",
            "winning an impossible contest", "translating a forgotten language",
            "forging an unlikely alliance", "healing a rift between worlds",
            "harnessing a volatile power source", "breaking a centuries-old enchantment",
            "finding their true identity", "surviving in a post-apocalyptic world",
            "assembling a team of specialized experts", "completing their mentor's unfinished work"
        };

        // Book title templates - grammar-safe, no number templates
        public static readonly List<string> BookTitleTemplates = new List<string>
        {
            // Original templates (excluding the number one)
            "The {Adjective} {Noun}",
            "{Noun} of {BookSubject}",
            "The Last {Character}",
            "{Character}'s {Noun}",
            "The {Adjective} {Character}",
            "{Adjective} {BookSubject}",
            "The {Setting} {Noun}",
            "{BookSubject} and {BookSubject}",
            "The {Noun} of the {Character}",
            "The {Character} and the {Noun}",
            "The {Adjective} {Setting}",
            "{BookSubject} in the {Setting}",
            "How to {Plot} in Ten Days",
            "My Life as a {Character}",
            
            // New templates for more variety
            "Beneath the {Adjective} {Noun}",
            "Beyond the {Setting}",
            "When {BookSubject} Falls",
            "Whispers of {BookSubject}",
            "Songs of {BookSubject} and {BookSubject}",
            "The {Character} of {Setting}",
            "{BookSubject}'s {Adjective} Promise",
            "The {Noun} Beneath",
            "Forgotten {Noun}",
            "Children of the {Setting}",
            "Legends of the {Character}",
            "Tales from the {Setting}",
            "Secrets of the {Adjective} {Noun}",
            "The {Adjective} Hour",
            "Between {BookSubject} and {BookSubject}",
            "The Last Days of {BookSubject}",
            "Shadows of the {Setting}",
            "Echoes of {BookSubject}",
            "Born of {BookSubject}",
            "While the {Setting} Burns"
        };

        // Book description templates - fixed to use "the" instead of "a/an" before placeholders
        public static readonly List<string> BookDescriptionTemplates = new List<string>
        {
            // Original templates
            "In the {Adjective} {Setting}, the {Character} discovers the {Adjective} {Noun} that changes everything. What follows is the {Adjective} tale of {BookSubject} and {BookSubject}, as our protagonist embarks on a journey {Plot}.",

            "The {Adjective} story of the {Character} {Plot} in the {Setting}. This {Adjective} book explores themes of {BookSubject} and {BookSubject} in a way that will leave readers spellbound.",

            "When the {Character} encounters the {Adjective} {Noun}, nothing is ever the same again. Set in the {Setting}, this {Adjective} narrative follows the protagonist's quest for {BookSubject} while {Plot}.",

            "The {Adjective} tale of the {Character} who must overcome {BookSubject} and {BookSubject} while {Plot}. Set against the backdrop of the {Setting}, this story will keep readers captivated until the very last page.",

            "The {Character} finds themselves in the {Adjective} situation when they discover the {Noun} with the power to change their {Setting} forever. What unfolds is the {Adjective} exploration of {BookSubject} as the protagonist faces the challenge of {Plot}.",
            
            // New templates for more variety
            "Deep within the {Setting}, the {Character} stumbles upon the {Adjective} {Noun} that holds the key to {BookSubject}. Their journey becomes a {Adjective} odyssey of self-discovery while {Plot}, forcing them to confront the very nature of {BookSubject}.",

            "The {Character}'s peaceful existence in the {Setting} is shattered when the {Adjective} {Noun} reveals a hidden truth about {BookSubject}. Thrust into a world of intrigue and danger, they find themselves {Plot} while grappling with profound questions about {BookSubject} and {BookSubject}.",

            "Across the {Adjective} expanses of the {Setting}, the legend of the {Noun} has been whispered for generations. When the {Character} unexpectedly becomes entangled with this myth, they are drawn into a {Adjective} quest {Plot}, forever altering their understanding of {BookSubject}.",

            "For centuries, the {Setting} has concealed the {Adjective} secret of {BookSubject}. When the {Character} unearths the {Noun} by chance, they are thrust into a {Adjective} struggle {Plot}, challenging everything they thought they knew about {BookSubject} and their own identity.",

            "The {Character} has always known the rules of {BookSubject} – until the day they encounter the {Adjective} {Noun} in the heart of the {Setting}. What begins as curiosity evolves into a {Adjective} mission {Plot}, revealing unexpected truths about the nature of {BookSubject} and {BookSubject}."
        };

        // Expanded review templates by rating
        public static readonly Dictionary<int, List<string>> ReviewTemplatesByRating = new Dictionary<int, List<string>>
        {
            // 1-star reviews - expanded to 20 templates
            { 1, new List<string>
                {
                    // Original 1-star reviews
                    "I couldn't even finish this {Adjective} book. The {Character} was completely {Adjective}, and the plot about {Plot} made absolutely no sense. The {Setting} setting was {Adjective} at best. I want my money back!",

                    "This has to be the worst book about {BookSubject} I've ever read. The {Character} was so {Adjective} that I couldn't relate at all. The author clearly knows nothing about {Plot}. Complete waste of time!",

                    "I've read cereal boxes with better plots than this {Adjective} disaster. The {Character} made decisions that no real person would make, and the {Setting} setting was described so poorly I couldn't picture it. How did this even get published?",

                    "Terrible. Just terrible. The {Adjective} writing style was painful to read, the {Character} had the personality of a cardboard box, and the storyline about {Plot} was full of plot holes. I'm actually angry I spent time on this.",

                    "Avoid at all costs! This book about {BookSubject} was so {Adjective} that I nearly fell asleep. The {Character} was totally unrealistic, and the {Adjective} dialogue made me cringe. One star is actually too generous.",
                    
                    // New 1-star reviews
                    "I'm stunned this got published. The portrayal of {BookSubject} was offensive, and the {Character}'s development was nonexistent. The {Setting} descriptions were tedious, and the plotline about {Plot} dragged on forever.",

                    "What a disappointment. The premise about {Plot} had potential, but the execution was {Adjective} at best. The {Character} was unlikable, and the handling of {BookSubject} felt shallow and uninformed.",

                    "Don't waste your time. The {Character} was inconsistent, the {Setting} was poorly realized, and the entire story about {Plot} felt contrived. The {Adjective} writing style made it a chore to finish.",

                    "I kept waiting for it to get better, but it never did. The {Adjective} dialogue felt forced, the {Character} was forgettable, and the themes of {BookSubject} were handled clumsily. Save your money!",

                    "This book is the literary equivalent of watching paint dry. The {Character} spent most of the time making unbelievable decisions, and the {Adjective} approach to {BookSubject} lacked any nuance or insight.",

                    "Pure torture from beginning to end. The {Character}'s motivations made no sense, the {Setting} descriptions were repetitive, and the storyline about {Plot} had more holes than Swiss cheese.",

                    "I rarely give one-star reviews, but this earned it. The {Adjective} prose was painful, the {Character} was a walking cliché, and the treatment of {BookSubject} was simplistic and borderline offensive.",

                    "I should have stopped reading after the first chapter. The {Setting} felt like an afterthought, the {Character} was completely one-dimensional, and the plot about {Plot} was predictable from page one.",

                    "Not worth the paper it's printed on. The {Adjective} narrative style was pretentious, the {Character} was impossible to root for, and the exploration of {BookSubject} lacked any meaningful insight.",

                    "I've never been so glad to finish a book. The {Character} was so {Adjective} that I couldn't relate at all, the {Setting} descriptions were tediously long, and the story about {Plot} went nowhere interesting.",

                    "Reading this was a test of endurance. The author clearly had no understanding of {BookSubject}, the {Character} was devoid of any personality, and the {Adjective} writing style was amateur at best.",

                    "Hard pass on this one. The handling of {BookSubject} was superficial, the {Character} lacked any clear motivation, and the attempts at making the {Setting} interesting fell completely flat.",

                    "I'm baffled by the positive reviews. The {Adjective} approach to {Plot} was disjointed, the {Character} was impossible to connect with, and the themes of {BookSubject} were handled without any depth.",

                    "This book manages to be both boring and infuriating. The {Character}'s arc made zero sense, the {Setting} descriptions were confusing, and the exploration of {BookSubject} was embarrassingly simplistic.",

                    "A complete waste of potential. The concept of {Plot} could have been fascinating, but the {Adjective} execution ruined it. The {Character} was frustratingly stupid, and the {Setting} never came to life."
                }
            },
            
            // 2-star reviews - expanded to 20 templates
            { 2, new List<string>
                {
                    // Original 2-star reviews
                    "This book had potential with its {Setting} setting, but the {Adjective} {Character} ruined it for me. The concept of {Plot} could have been interesting if executed better. Unfortunately, it fell flat about halfway through.",

                    "I was excited about a story featuring {BookSubject}, but this was disappointing. The {Character} was somewhat {Adjective}, but the plot was predictable. The {Adjective} writing style didn't help either.",

                    "Not the worst I've read, but close. The {Setting} was actually well-described, but the {Character} was so {Adjective} that I couldn't root for them. The theme of {BookSubject} deserved better treatment.",

                    "Started strong with an interesting premise about {Plot}, but quickly became {Adjective} and boring. The {Character} had no real development, and the ending was unsatisfying. Could've been much better.",

                    "I'm giving this two stars only because the {Setting} setting was somewhat original. Otherwise, the {Adjective} storyline about {BookSubject} was a mess, and the {Character} made me roll my eyes constantly.",
                    
                    // New 2-star reviews
                    "There were some redeeming qualities. The idea of {Plot} was intriguing, but the {Character} never developed beyond a stereotype. The {Setting} had moments of interest, though the {Adjective} pacing made it hard to appreciate.",

                    "I wanted to like this more than I did. The exploration of {BookSubject} showed promise, but the {Character} was too {Adjective} to be believable. The prose wasn't terrible, just mediocre.",

                    "This book needed a better editor. There were glimpses of a good story about {Plot}, but the {Character}'s motivations shifted randomly, and the {Setting} details were inconsistent. A frustrating read overall.",

                    "A forgettable experience. The {Character} had potential but remained {Adjective} throughout. The {Setting} was the highlight, but couldn't compensate for the flimsy treatment of {BookSubject}.",

                    "Just barely okay. The concept of {Plot} was the strongest element, but the {Adjective} dialogue and underdeveloped {Character} prevented this from being truly enjoyable.",

                    "I finished it, but barely. The {Character} was somewhat interesting, but the {Adjective} narrative style made the storyline about {Plot} feel disjointed and confusing.",

                    "A mixed bag at best. The {Setting} was well-realized, but the {Character} was too {Adjective} to be relatable, and the treatment of {BookSubject} lacked depth or nuance.",

                    "I'm being generous with two stars. The premise involving {Plot} was decent, but the {Character} made illogical choices, and the {Adjective} prose was distracting rather than engaging.",

                    "There's a kernel of a good book here. The themes of {BookSubject} were thought-provoking, but the {Character} never felt fully developed, and the {Setting} was underutilized.",

                    "Some interesting ideas lost in poor execution. The {Character} started strong but became increasingly {Adjective} as the story progressed. The exploration of {Plot} had moments but ultimately disappointed.",

                    "Not the worst book I've read this year, but close. The {Setting} descriptions had some charm, but the {Character} was too {Adjective} to care about, and the handling of {BookSubject} was superficial.",

                    "Two stars for effort. The author clearly wanted to say something meaningful about {BookSubject}, but the {Character} fell flat, and the storyline about {Plot} meandered without purpose.",

                    "Missed opportunities throughout. The {Setting} had real potential, and some aspects of the {Character} were interesting, but the {Adjective} pacing made everything feel tedious.",

                    "I pushed through hoping it would improve. The concept of {Plot} was compelling, but the {Character} remained stubbornly {Adjective}, and the exploration of {BookSubject} never deepened.",

                    "Almost good, but not quite there. The {Setting} was vivid at times, but the {Character}'s development was inconsistent, and the {Adjective} handling of {Plot} felt amateurish."
                }
            },
            
            // 3-star reviews - expanded to 20 templates
            { 3, new List<string>
                {
                    // Original 3-star reviews
                    "A decent read overall. The {Character} was reasonably {Adjective}, and I enjoyed the {Setting} setting. The story about {Plot} had some good moments, though it dragged in places. Not amazing, but not terrible either.",

                    "Middle of the road. The author's take on {BookSubject} was interesting, and the {Character} had some {Adjective} moments. However, the storyline about {Plot} felt uneven. Worth a read if you have nothing else in your queue.",

                    "This book was just okay. The {Setting} was described well, and the theme of {BookSubject} was handled competently. The {Character} could have been more {Adjective}, but I still finished the book, so that says something.",

                    "Three stars for an average reading experience. The {Adjective} writing style was fine, and the story about {Plot} had its moments. The {Character} was relatable enough, but nothing about this book will stick with me.",

                    "Neither great nor terrible. The {Setting} setting was a nice backdrop for the story about {BookSubject}. The {Character} was somewhat {Adjective}, which helped me get through the more predictable parts about {Plot}.",
                    
                    // New 3-star reviews
                    "A solid middle-of-the-road read. The {Character} had moments of being genuinely {Adjective}, and the treatment of {BookSubject} was adequate. The {Setting} could have been more fully realized, but it served its purpose.",

                    "I didn't love it, but I didn't hate it either. The {Character}'s journey through {Plot} had interesting moments, though the pacing was uneven. The {Setting} details added some {Adjective} atmosphere.",

                    "There's potential here that wasn't fully realized. The {Character} had a compelling backstory, and the themes of {BookSubject} were handled with some insight. The {Adjective} conclusion left me wanting more.",

                    "A mixed but ultimately satisfying experience. The {Character} was occasionally {Adjective}, which worked well with the story about {Plot}. The {Setting} was conventional but effective.",

                    "This book was fine. Not spectacular, but not terrible. The {Character}'s development was predictable but authentic, and the exploration of {BookSubject} had some thoughtful moments. The {Setting} was {Adjective} enough to be memorable.",

                    "I have conflicted feelings about this one. The {Character} was impressively {Adjective}, but the storyline about {Plot} dragged in the middle. The treatment of {BookSubject} showed genuine understanding.",

                    "An uneven but worthwhile read. The {Setting} was beautifully depicted, though the {Character} sometimes felt too {Adjective}. The themes of {BookSubject} were explored with moderate success.",

                    "Three stars feels right for this one. The {Character}'s arc had meaningful moments, particularly when dealing with {BookSubject}. The {Adjective} approach to {Plot} was neither revolutionary nor disappointing.",

                    "A perfectly average book. The {Character} was reasonably well-developed, the {Setting} was described with adequate detail, and the storyline about {Plot} held my interest most of the time.",

                    "Worth reading but not re-reading. The {Character} had an interesting perspective on {BookSubject}, and the {Setting} had some {Adjective} moments. The resolution of {Plot} was satisfying if predictable.",

                    "This book did what it set out to do. The {Character} was believably {Adjective}, the {Setting} served the story well, and the exploration of {BookSubject} had moments of genuine insight.",

                    "I'm in the middle on this one. The {Character}'s struggle with {BookSubject} felt authentic, and the {Setting} had some {Adjective} qualities. The story about {Plot} wasn't groundbreaking but kept me engaged.",

                    "A good book that could have been great. The {Character} was likable if sometimes too {Adjective}, and the handling of {Plot} showed promise. The {Setting} details were a highlight.",

                    "Three stars for consistent quality. The {Character} developed naturally throughout the story, the themes of {BookSubject} were treated with respect, and the {Setting} had some {Adjective} moments.",

                    "This will appeal to some readers more than others. The {Character} was competently written if somewhat {Adjective}, the {Setting} was well-researched, and the storyline about {Plot} had a satisfying structure."
                }
            },
            
            // 4-star reviews - expanded to 20 templates
            { 4, new List<string>
                {
                    // Original 4-star reviews
                    "I really enjoyed this book! The {Character} was wonderfully {Adjective}, and the story about {Plot} kept me turning pages. The {Setting} setting was vividly portrayed. Would definitely recommend, with just a few minor issues.",

                    "A great read that I couldn't put down. The author's exploration of {BookSubject} was thought-provoking, and the {Character} was both {Adjective} and relatable. The {Setting} came alive in my imagination. Highly recommended!",

                    "Four stars for this engaging story! The {Adjective} writing pulled me in, and the {Character}'s journey through the {Setting} was captivating. The theme of {BookSubject} was handled with nuance. Just short of perfect.",

                    "I was pleasantly surprised by this book. The plot involving {Plot} was well-constructed, and the {Character} was wonderfully {Adjective}. The author's description of the {Setting} made me feel like I was there. Very good read!",

                    "This book exceeded my expectations! The {Adjective} narrative about {BookSubject} was compelling, and the {Character} had real depth. I particularly enjoyed how the author brought the {Setting} to life. Will read more from this author.",
                    
                    // New 4-star reviews
                    "I was thoroughly impressed by this book. The {Character} was remarkably {Adjective}, bringing depth to the narrative about {Plot}. The {Setting} was richly detailed, and the exploration of {BookSubject} was insightful and nuanced.",

                    "A standout read that I'll recommend to friends. The {Character}'s development was masterfully handled, and the {Adjective} approach to {BookSubject} felt fresh. The {Setting} became almost a character itself.",

                    "Nearly perfect, with just a few minor flaws. The {Character} was wonderfully {Adjective}, and the story about {Plot} was captivating from start to finish. The treatment of {BookSubject} showed real understanding and sensitivity.",

                    "I found myself completely absorbed in this book. The {Character} was authentically {Adjective}, making the exploration of {Plot} genuinely moving. The {Setting} was evoked with skill and precision.",

                    "A remarkable achievement. The {Character}'s journey through the {Setting} was both believable and {Adjective}, and the themes of {BookSubject} were developed with exceptional care and insight.",

                    "This book stayed with me long after I finished it. The {Character} was impressively {Adjective}, and the storyline about {Plot} was both original and compelling. The {Setting} details enhanced every scene.",

                    "Four solid stars for this exceptional story. The {Character} was brilliantly conceived, the {Adjective} writing style was a perfect match for the subject matter, and the exploration of {BookSubject} was thought-provoking.",

                    "I was pleasantly surprised by the depth of this book. The {Character}'s struggle with {BookSubject} was portrayed with nuance, and the {Setting} felt authentically {Adjective}. The plot involving {Plot} was expertly crafted.",

                    "A book I'll definitely revisit. The {Character} was memorably {Adjective}, the {Setting} was brought to life with vivid detail, and the treatment of {BookSubject} was both intelligent and accessible.",

                    "This deserves all the praise it's received. The {Character} was exceptionally well-developed, the storyline about {Plot} was engrossing, and the {Adjective} atmosphere of the {Setting} was palpable throughout.",

                    "Intelligent, engaging, and emotionally resonant. The {Character} was wonderfully {Adjective}, the exploration of {BookSubject} was sophisticated without being pretentious, and the {Setting} details were impeccably researched.",

                    "I'm already looking forward to reading this again. The {Character}'s development throughout the story was masterful, the {Setting} was described with {Adjective} precision, and the themes of {BookSubject} were handled with remarkable insight.",

                    "This book exceeded my expectations. The {Character} was genuinely {Adjective} in a way that felt natural, not forced, and the storyline about {Plot} was both surprising and satisfying. The {Setting} was the perfect backdrop.",

                    "A near-perfect reading experience. The {Character} was refreshingly {Adjective}, the treatment of {BookSubject} was both respectful and illuminating, and the {Setting} details added immeasurably to the atmosphere.",

                    "I couldn't put this down. The {Character}'s perspective on {BookSubject} was fascinating, the {Adjective} prose was a joy to read, and the story about {Plot} had me completely invested from the first page."
                }
            },
            
            // 5-star reviews - expanded to 20 templates
            { 5, new List<string>
                {
                    // Original 5-star reviews
                    "Absolutely brilliant! The {Character} was incredibly {Adjective}, and the storyline about {Plot} was masterfully crafted. The {Setting} setting was so immersive I lost track of time. One of the best books I've ever read!",

                    "A true masterpiece! The author's exploration of {BookSubject} was profound, and the {Character} will stay with me for a long time. The {Adjective} narrative set in the {Setting} was nothing short of genius. Couldn't put it down!",

                    "Five stars isn't enough for this incredible book! The {Character}'s journey through {Plot} was emotionally powerful, and the {Setting} was described so vividly I felt I was there. A perfect blend of {BookSubject} and {BookSubject}.",

                    "I'm still reeling from this amazing read! The {Adjective} {Character} was one of the most compelling protagonists I've encountered, and the story about {Plot} kept me on the edge of my seat. The {Setting} was the perfect backdrop. A must-read!",

                    "This book changed my perspective on {BookSubject}! The {Adjective} writing style was beautiful, and the {Character}'s arc was perfectly executed. The {Setting} setting added depth to the already powerful narrative about {Plot}. Absolutely perfect!",
                    
                    // New 5-star reviews
                    "An instant classic that deserves every accolade. The {Character} was extraordinarily {Adjective}, bringing unprecedented depth to the exploration of {BookSubject}. The {Setting} was realized with such vivid detail that I felt physically transported.",

                    "This book has changed how I see the world. The {Character}'s journey through {Plot} was profoundly moving, and the {Adjective} treatment of {BookSubject} was revolutionary. The {Setting} came alive with unprecedented realism.",

                    "A masterpiece in every sense. The {Character} was perfectly {Adjective} - complex, flawed, and utterly human. The storyline about {Plot} was brilliantly conceived and flawlessly executed. The {Setting} details showed remarkable attention to historical accuracy.",

                    "I'm struggling to express how much this book affected me. The {Character} was breathtakingly {Adjective}, the exploration of {BookSubject} was both challenging and illuminating, and the {Setting} was depicted with astonishing precision.",

                    "Without hyperbole, one of the finest books I've ever read. The {Character}'s development throughout the narrative was nothing short of miraculous, and the treatment of {Plot} showed extraordinary insight. The {Adjective} prose was consistently stunning.",

                    "A towering achievement that will stand the test of time. The {Character} was unforgettably {Adjective}, the themes of {BookSubject} were explored with unparalleled depth, and the {Setting} was brought to life with exceptional skill.",

                    "Literature at its absolute finest. The {Character} was written with incredible empathy and nuance, the storyline about {Plot} was both intellectually stimulating and emotionally affecting, and the {Setting} details reflected meticulous research.",

                    "I finished this book in awe. The {Character}'s complexity and {Adjective} nature felt revolutionary, the exploration of {BookSubject} was profound yet accessible, and the {Setting} became a vital element of the narrative.",

                    "Perfect in every measurable way. The {Character} was exquisitely {Adjective}, the treatment of {Plot} was both original and timeless, and the themes of {BookSubject} were explored with remarkable sensitivity and intelligence.",

                    "This book has earned a permanent place on my shelf. The {Character}'s journey through the {Adjective} {Setting} was utterly captivating, and the exploration of {BookSubject} showed exceptional wisdom and insight.",

                    "An extraordinary reading experience that I'll never forget. The {Character} was brilliantly {Adjective}, the storyline about {Plot} was perfectly paced and emotionally resonant, and the {Setting} details were impeccably chosen.",

                    "I'm struggling to find adequate superlatives. The {Character} will remain with me forever, the treatment of {BookSubject} was both challenging and illuminating, and the {Adjective} atmosphere of the {Setting} was consistently transportive.",

                    "One of those rare books that feels life-changing. The {Character} was remarkably {Adjective} - simultaneously unique and universally relatable. The exploration of {Plot} showed exceptional narrative craft, and the {Setting} details were flawless.",

                    "Every aspect of this book is deserving of praise. The {Character}'s development was masterfully handled, the themes of {BookSubject} were explored with extraordinary depth, and the {Setting} was depicted with {Adjective} precision.",

                    "A once-in-a-generation literary achievement. The {Character} was phenomenally {Adjective}, the storyline about {Plot} was both intellectually and emotionally satisfying, and the {Setting} came alive with unprecedented vividness."
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