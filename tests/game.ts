import * as anchor from "@project-serum/anchor";
import * as assert from "assert";
import { Program } from "@project-serum/anchor";
import { Game } from "../target/types/game";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("game", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Game as Program<Game>;

  const wallet = anchor.workspace.Game.provider.wallet.payer;
  const [gameDataAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("level1")
    ],
    program.programId
  )
  console.log("gameDataAccount", gameDataAccount.toBase58())

  const [chestVaultAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("chestVault")
    ],
    program.programId
  )
  console.log("chestVaultAccount", chestVaultAccount.toBase58())  

  it("Is initialized!", async () => {
    await program.methods.initializeLevelOne()
      .accounts({
        newGameDataAccount: gameDataAccount,
        chestVault: chestVaultAccount,
        signer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // get the balance of the chest vault
    const chestVaultAccountInfo = await program.provider.connection.getAccountInfo(chestVaultAccount);
    const chestVaultAccountBalance = chestVaultAccountInfo.lamports;
    const expected_balance = 1002240;

    // Chest Vault Balance should just be rent
    assert.strictEqual(chestVaultAccountBalance, expected_balance);
  });


  it("Level Reset and Chest Vault filled", async () => {
    await program.methods.resetLevelAndSpawnChest()
      .accounts({
        payer: wallet.publicKey,
        chestVault: chestVaultAccount,
        gameDataAccount: gameDataAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // get the balance of the chest vault
    const chestVaultAccountInfo = await program.provider.connection.getAccountInfo(chestVaultAccount);
    const chestVaultAccountBalance = chestVaultAccountInfo.lamports;

    // get the playerPosition from the gameDataAccount
    const gameDataAccountInfo = await program.provider.connection.getAccountInfo(gameDataAccount);
    const gameDataAccountData = gameDataAccountInfo.data;
    const info = program.coder.accounts.decode("GameDataAccount", gameDataAccountData);
    
    const playerPosition = info.playerPosition;
    const expected_reward = 1002240 + (LAMPORTS_PER_SOL / 10);
    
    // Chest Vault Balance should be rent + reward, and player should be at position 0
    assert.strictEqual(chestVaultAccountBalance, expected_reward);
    assert.strictEqual(playerPosition, 0);
  });

  it("Player Moves Right Once", async () => {
    await program.methods.moveRight("gib")
      .accounts({
        chestVault: chestVaultAccount,
        gameDataAccount: gameDataAccount,
        player: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // get the balance of the chest vault
    const chestVaultAccountInfo = await program.provider.connection.getAccountInfo(chestVaultAccount);
    const chestVaultAccountBalance = chestVaultAccountInfo.lamports;
    
    // get the playerPosition from the gameDataAccount
    const gameDataAccountInfo = await program.provider.connection.getAccountInfo(gameDataAccount);
    const gameDataAccountData = gameDataAccountInfo.data;
    const info = program.coder.accounts.decode("GameDataAccount", gameDataAccountData);
    
    const playerPosition = info.playerPosition;
    const expected_reward = 1002240 + ((LAMPORTS_PER_SOL / 10));
    
    // Chest Vault Balance should be rent + reward, and player should be at position 1
    assert.strictEqual(chestVaultAccountBalance, expected_reward);
    assert.strictEqual(playerPosition, 1);
  });

  it("Player Moves Right to 2nd Spot", async () => {
    await program.methods.moveRight("gib")
      .accounts({
        chestVault: chestVaultAccount,
        gameDataAccount: gameDataAccount,
        player: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // get the balance of the chest vault
    const chestVaultAccountInfo = await program.provider.connection.getAccountInfo(chestVaultAccount);
    const chestVaultAccountBalance = chestVaultAccountInfo.lamports;

    // get the playerPosition from the gameDataAccount
    const gameDataAccountInfo = await program.provider.connection.getAccountInfo(gameDataAccount);
    const gameDataAccountData = gameDataAccountInfo.data;
    const info = program.coder.accounts.decode("GameDataAccount", gameDataAccountData);

    const playerPosition = info.playerPosition;
    const expected_reward = 1002240 + ((LAMPORTS_PER_SOL / 10));
    
    // Chest Vault Balance should be rent + reward, and player should be at position 2
    assert.strictEqual(chestVaultAccountBalance, expected_reward);
    assert.strictEqual(playerPosition, 2);
  });

  it("Player Moves Right to 3rd spot and wins", async () => {
    await program.methods.moveRight("gib")
      .accounts({
        chestVault: chestVaultAccount,
        gameDataAccount: gameDataAccount,
        player: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // get the balance of the chest vault
    const chestVaultAccountInfo = await program.provider.connection.getAccountInfo(chestVaultAccount);
    const chestVaultAccountBalance = chestVaultAccountInfo.lamports;

    // get the playerPosition from the gameDataAccount
    const gameDataAccountInfo = await program.provider.connection.getAccountInfo(gameDataAccount);
    const gameDataAccountData = gameDataAccountInfo.data;
    const info = program.coder.accounts.decode("GameDataAccount", gameDataAccountData);

    const playerPosition = info.playerPosition;
    const expected_reward = 1002240;

    // Chest Vault Balance should just be rent, and player should be at position 3
    assert.strictEqual(chestVaultAccountBalance, expected_reward);
    assert.strictEqual(playerPosition, 3);
  });
});
