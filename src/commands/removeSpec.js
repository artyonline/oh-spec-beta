const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType} = require('discord.js')
const UserProfile = require('../Schemas/UserSchema');

const data = {
    name: 'remove-spec',
    description: 'Select and Remove Your Specialization'
}

/**
 * 
 * @param {Object} param0
 * @param {import('discord.js').ChatInputCommandInteraction} param0.interaction 
 */
async function run({ interaction }) {
    // Commands can only be executed in a discord server
    if (!interaction.inGuild()) {
        interaction.reply({
            content: "This command can only be executed in a server.",
            ephemeral: true
        });
        return;
    }

    let currentUser = await UserProfile.findOne({
        userId: interaction.user.id
    });

    if(!currentUser || currentUser.specialization.length <= 0) {
        interaction.reply({
            content: "You have not Selected Any Specialization",
            ephemeral: true
        });
        return
    }

    //Create Menu
    const removeMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("Select Specializations to remove!")
    .setMinValues(0)
    .setMaxValues(currentUser.specialization.length)
    .addOptions(currentUser.specialization.map((spec) => 
            new StringSelectMenuOptionBuilder()
            .setLabel(spec)
            .setDescription(`Select to Remove`)
            .setValue(spec)
    ));

    const actionRow = new ActionRowBuilder().addComponents(removeMenu);

    const reply = await interaction.reply({
        content: "Choose Specialization to Remove",
        components: [actionRow],
        fetchReply: true,
    })

    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 60_000
    })

    collector.on('collect', async (interaction) => {
        if(interaction.values.length > 0) {
            interaction.reply(`Specializations Unassigned from you: ${interaction.values.join(', ')}`)
            await removeSpecAndSave(interaction, interaction.values);
        }
    });
}

async function removeSpecAndSave(interaction, specList) {

    let currentUser = await UserProfile.findOne({
        userId: interaction.user.id
    });
    console.log(currentUser.specialization)
    specList.forEach(spec => {
        var index = currentUser.specialization.indexOf(spec);
        if (index >= 0) {
            currentUser.specialization.splice(index, 1);
        }
    })

    await currentUser.save();

}

module.exports = {data, run};