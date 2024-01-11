use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_lang::system_program;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("3L9CnAEGvcy3zhToKb3W3frSgRJrnzfEftczEX7AUtMQ");

#[program]
mod game {
    use super::*;
    
    #[error_code]
    pub enum MyError {
        #[msg("Password was wrong")]
        WrongPassword,
    }

    // The amount of lamports that will be put into chests and given out as rewards.
    const CHEST_REWARD: u64 = LAMPORTS_PER_SOL / 10; // 0.1 SOL

    // This is the entry point for the initialize level one instruction
    pub fn initialize_level_one(_ctx: Context<InitializeLevelOne>) -> Result<()> {
        // Usually in your production code you would not print lots of text because it cost compute units.
        msg!("A Journey Begins!");
        msg!("o.......💎");
        Ok(())
    }

    // this will the the player position of the given level back to 0 and fill up the chest with sol
    pub fn reset_level_and_spawn_chest(ctx: Context<SpawnChest>) -> Result<()> {
        ctx.accounts.game_data_account.player_position = 0;

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.payer.to_account_info().clone(),
                to: ctx.accounts.chest_vault.to_account_info().clone(),
            },
        );
        system_program::transfer(cpi_context, CHEST_REWARD)?;

        msg!("Level Reset and Chest Spawned at position 3");

        Ok(())
    }

    // this will move the player to the right and check if the player has reached the chest,
    // it uses a password as a safety measure to make sure the signer has authority to move the player
    pub fn move_right(ctx: Context<MoveRight>, password: String ) -> Result<()> {
        let game_data_account = &mut ctx.accounts.game_data_account;
        if game_data_account.player_position == 3 {
            msg!("You have reached the end! Super!");
        } else if game_data_account.player_position == 2 {
            game_data_account.player_position = game_data_account.player_position + 1;

            // Check if the password is correct
            if password != "gib" {
                return err!(MyError::WrongPassword);
            }

            msg!(
                "You made it! Here is your reward {0} lamports",
                CHEST_REWARD
            );

            // Transfer the reward to the player
            **ctx
                .accounts
                .chest_vault
                .to_account_info()
                .try_borrow_mut_lamports()? -= CHEST_REWARD;
            **ctx
                .accounts
                .player
                .to_account_info()
                .try_borrow_mut_lamports()? += CHEST_REWARD;
        } else {
            game_data_account.player_position = game_data_account.player_position + 1;
            print_player(game_data_account.player_position);
        }
        Ok(())
    }
}

// This is a helper function to print the player position within the on-chain transaction
fn print_player(player_position: u8) {
    if player_position == 0 {
        msg!("A Journey Begins!");
        msg!("o.........💎");
    } else if player_position == 1 {
        msg!("..o.......💎");
    } else if player_position == 2 {
        msg!("....o.....💎");
    } else if player_position == 3 {
        msg!("........\\o/💎");
        msg!("..........\\o/");
        msg!("You have reached the end! Super!");
    }
}

#[derive(Accounts)]
pub struct InitializeLevelOne<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 1 byte come from NewAccount.data being type u8.
    // (u8 = 8 bits unsigned integer = 1 byte)
    // You can also use the signer as seed [signer.key().as_ref()],
    #[account(
        init_if_needed,
        seeds = [b"level1"],
        bump,
        payer = signer,
        space = 8 + 1
    )]
    pub new_game_data_account: Account<'info, GameDataAccount>,
    // This is the PDA in which we will deposit the reward SOl and
    // from where we send it back to the first player reaching the chest.
    #[account(
        init_if_needed,
        seeds = [b"chestVault"],
        bump,
        payer = signer,
        space = 8 + 8
    )]
    pub chest_vault: Account<'info, ChestVaultAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SpawnChest<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, seeds = [b"chestVault"], bump)]
    pub chest_vault: Account<'info, ChestVaultAccount>,
    #[account(mut)]
    pub game_data_account: Account<'info, GameDataAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MoveRight<'info> {
    #[account(mut, seeds = [b"chestVault"], bump)]
    pub chest_vault: Account<'info, ChestVaultAccount>,
    #[account(mut)]
    pub game_data_account: Account<'info, GameDataAccount>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct GameDataAccount {
    player_position: u8,
}

#[account]
pub struct ChestVaultAccount {
    pub chest_reward: u64,
}