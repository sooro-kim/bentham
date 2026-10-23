# Jeremy Bentham

A static website on Jeremy Bentham (1748–1832), Build 3 for a History of Economic Thought course: the felicific calculus,
the diminishing utility of money, and his break with laissez-faire.
Content is drawn from E. K. Hunt & Mark Lautzenheiser, *History of Economic Thought: A Critical Perspective* (3rd ed., 2011), ch. 6.

The site follows the format of the Ricardo site (Build 2) with a bottle-green and brass theme. As there, nothing can be skimmed:
every page holds its content behind questions the visitor must answer, and the games unlock in order.

## Pages

| Page | File | How the visitor earns it |
|---|---|---|
| Home | `index.html` | A first-guess question (the labourer and the richest man, revisited in game ii) and the visitor's ledger of seals |
| About | `about.html` | Five chapters; each opens after a question on the one before |
| Key Ideas | `ideas.html` | Ten ideas; each opens only after its puzzle is solved |
| Timeline | `timeline.html` | Put events in order (no dates shown); then the year slider opens |
| Critics & Legacy | `critics.html` | Name the Benthamite doctrine each critic or heir attacked or extended |
| Quotes | `quotes.html` | Finish his sentences by reasoning from the theory |
| Model | `model.html` | Calculus, utility-of-money, and hoarding models with sliders; three tasks |
| Play and Learn | `play.html`, `games/` | Four games in order, then the Examination |
| Sources | `sources.html` | |

Games: `calculus.html` (The Felicific Calculus), `purse.html` (The Labourer and the Richest Man), `chest.html` (The Money in the Chest),
`tribunal.html` (The Tribunal of Utility), `exam.html` (The Examination: fresh random numbers each attempt, certificate at 10/12).

Shared files: `css/style.css`; `js/site.js` (header, footer, the Ledger of progress, page locks); `js/learn.js` (answer-first
question blocks); `js/econ.js` (the three models used by the Model page, the games, and the Examination).

The models are simplified, stated versions of Bentham's arguments, not formulas he wrote. The one number taken from Bentham is
his guess that 50,000 times the income gives at most five, more likely two, times the pleasure (Hunt p. 133).

Progress is kept in the visitor's browser (`localStorage`). For a class demonstration, add `?presenter` to any URL to open every
lock for that browser tab.

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Images

All images come from Wikimedia Commons and are public domain, except the Auto-icon photograph (CC0) and the
Malthus portrait (Wellcome Collection, CC BY 4.0). Full credits are on `sources.html`.
