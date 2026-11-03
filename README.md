# Aurora: Caçadores de Feras (v0.1)

Um RPG de captura de criaturas original, no estilo dos clássicos de portátil. Funciona no Windows e no Android.

## Jogar no PC (Windows)
- **Instalar:** `release/Aurora Feras Setup 0.1.0.exe`. Ele cria um atalho na área de trabalho.
- **Sem instalar:** `release/AuroraFeras-portatil.exe`.

| Ação | Teclado | Controle (Xbox/PS) |
|---|---|---|
| Andar | Setas ou WASD | Direcional / analógico |
| A (confirmar/falar) | Z, Espaço ou J | A / X |
| B (voltar / correr segurando) | X, Backspace ou Shift | B / Círculo |
| Menu (Start) | Enter ou Esc | Start |
| Tela cheia | F11 | — |

O jogo salva pelo menu **SALVAR**.

## Jogar no celular (Android)
O projeto Android já está em `android/`. Para gerar o `.apk`, é preciso ter o Android Studio (ou o Android SDK) instalado:
```
npm run android:sync
cd android
gradlew assembleDebug
```
O APK fica em `android/app/build/outputs/apk/debug/app-debug.apk`. Copie para o celular e instale (é preciso permitir "fontes desconhecidas"). No celular aparecem um direcional e os botões A/B/Start na tela.

## Desenvolvimento
- `npm run dev`: abre no navegador para testar
- `npm run build`: checagem de tipos + build
- `npm run dist:win`: gera os `.exe`
- `npx vite-node scripts/check-maps.ts`: valida os mapas

Os dados do jogo são fáceis de editar:
- criaturas: `src/data/species.ts`
- golpes: `src/data/moves.ts`
- itens: `src/data/items.ts`
- mapas e história: `src/data/maps.ts`

O som está **desligado** por enquanto. Para ligar, mude `SOM_DESATIVADO` para `false` em `src/engine/audio.ts`.
