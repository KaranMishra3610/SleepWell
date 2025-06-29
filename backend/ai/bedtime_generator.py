import random

# Expanded database of bedtime content
stories_and_lullabies = {
    "young": {
        "story": {
            "space": [
                "🚀 Luna’s Secret Orbit\n\nLuna, an inventor girl, made a hoverboard powered by yawns. Every night, she’d launch into space where comets sang lullabies. She mapped planets shaped like bedtime snacks and returned with dreams in her pockets. One night she didn’t return… but her dreams arrived anyway—in everyone’s sleep."
            ],
            "animals": [
                "🦊 Freddie the Fox’s Pajama Parade\n\nFreddie the little fox wore the fluffiest pajamas. Every night he tiptoed through the forest giving sleepy hugs to hedgehogs, owls, and rabbits. When the stars blinked, they blinked back at him—ready to dream together."
            ],
            "dreams": [
                "💤 Pillow of Wishes\n\nA little girl found a magical pillow. Each night she whispered a dream into it, and the pillow puffed and floated her to dreamland where clouds became cupcakes and rivers giggled. Her dreams were always kind and warm."
            ],
            "nature": [
                "🌳 Whispering Tree\n\nEvery night, a wise old tree told stories to the forest. Fireflies sat on its branches and animals snuggled at its roots. The wind carried its tales to every sleeping child in the world."
            ]
        },
        "lullaby": {
            "space": [
                "🌌 Cosmic Cradle\n\nSleep now, tiny astronaut,\nStars will hum your song.\nRocket ships and moonlight dreams,\nWill keep you safe all night long."
            ],
            "animals": [
                "🦉 Forest Lullaby\n\nHush now, little squirrel,\nFoxes dream nearby,\nOwls sing on treetops,\nUnderneath the sky."
            ],
            "dreams": [
                "🎵 Sleep, My Little Universe\n\nSleep, my little universe, the stars will hold you near.\nThe moon will hum a lullaby that only you can hear..."
            ],
            "nature": [
                "🌾 Breeze in the Meadow\n\nThe grass sways in rhythm, the stars gently gleam,\nClose your sweet eyes and drift into dream."
            ]
        }
    },
    "older": {
        "story": {
            "space": [
                "🛰️ The Starlight Map\n\nA teen explorer mapped dream coordinates across the galaxy. Each star he charted lit up a dream for someone on Earth. One day, he vanished… but every night, one new star appears—still adding dreams to his map."
            ],
            "animals": [
                "🐻 Baloo's Midnight Stroll\n\nBaloo the bear couldn’t sleep. So he wandered through the moonlit woods humming lullabies to fireflies and frogs. By dawn, he had tucked every creature into dreams—including himself."
            ],
            "dreams": [
                "✨ Dreamtail Chronicles\n\nIn a city where dreams were currency, a girl collected lost dreams and set them free. Her kindness stitched soft endings to even the loneliest minds."
            ],
            "nature": [
                "🌊 Ocean’s Whisper\n\nThe waves at night sang in ancient tongue. Surfers and sailors listened and smiled in their sleep. One boy heard them call his name—and knew he belonged to the sea."
            ]
        },
        "lullaby": {
            "space": [
                "🛸 Lullaby from Mars\n\nCrimson dust, a violet sky,\nLet your weary spirit fly.\nTonight, the Martians sing to you,\nIn a cradle of the stars so true."
            ],
            "animals": [
                "🦌 Night Herd\n\nGentle deer and sleepy sheep,\nGuard your dreams while you sleep.\nWhispers of the forest fair,\nFloat like magic through the air."
            ],
            "dreams": [
                "🛏️ Star Blanket\n\nWrap yourself in stardust, love, and drift across the sea,\nWhere moonlight dolphins sing to you beneath a dreamland tree..."
            ],
            "nature": [
                "🌲 Twilight Grove\n\nSleep beneath the glowing moss,\nDreams will come with wings of gloss.\nBreezes hum and rivers play,\nTill you wake at dawn’s soft ray."
            ]
        }
    }
}

def generate_bedtime_story(style="story", age_group="young", theme="dreams"):
    try:
        age_group = age_group if age_group in stories_and_lullabies else "young"
        style = style if style in stories_and_lullabies[age_group] else "story"
        theme_data = stories_and_lullabies[age_group][style]
        theme = theme if theme in theme_data else random.choice(list(theme_data.keys()))

        options = theme_data[theme]
        return random.choice(options)

    except Exception as e:
        print("❌ Error selecting bedtime story/lullaby:", e)
        return "Once upon a time, a sleepy star blinked slowly in the sky and whispered, 'Time to rest now.'"
