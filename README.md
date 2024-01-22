# Simple Solana Game using Lootboxes

This repo contains the Solana Program of [Tiny Adventurer 2](https://beta.solpg.io/tutorials/tiny-adventure-two) developed by [Jonas Hahn](https://github.com/Woody4618) with accompanying Test Code to verify the functionality of the program.

The game is a simple lootbox game where the creator can store an amount of SOL into the `ChestVaultAccount` after the player calls on `MoveRight` 3 times, they are rewarded with the SOL inside of the lootbox.

## Program Functions
- `initialize_level_one` - Creates the GameDataAccount and the ChestVaultAccount as a PDA
- `reset_level_and_spawn_chest` - Resets the player position back to 0 and loads the `ChestVaultAccount` with SOL from the signer
- `move_right` - Increments the player position by 1 and checks to see if the player has reached the end of the level, thus releasing the loot


## Getting Started

1. Clone the repo
2. Run `npm install`
3. Run `anchor build` to build the program
4. In separate terminal window run `solana-test-validator` to start a local Solana cluster
5. In primary window run `anchor deploy` to deploy the program to the local cluster
6. Update your program id in `Anchor.toml` and `lib.rs` to match the deployed program id
7. Run `anchor test` to run the test code