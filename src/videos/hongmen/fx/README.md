# fx/: moved

The stable outline pass, the rim light and the stability helpers are now in the shared kit: `src/kit/fx/` (its
README.md has the whole story; KIT.md at the repo root). The `.ts` files here re-export them, so every Hongmen import
(`./fx/ink`, `../fx/stable` ...) works unchanged.
