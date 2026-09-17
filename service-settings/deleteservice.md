# Delete Project

:::tip
The delete project button is only shown when the project is on the Trial plan (the Skapi dashboard shows it as Free), when its paid plan is already set to cancel at the end of the billing period, or when the project is suspended.
A suspended project can be deleted from the dashboard, which is also true while it is waiting out its 30 day deletion clock.
:::

You can delete your project from the project settings page.

The delete project button is located at the bottom of the project settings page.

:::warning Only the project owner can delete a project
Deleting, disabling and enabling a project belong to the **project owner's Skapi account**. An [admin](/admin/permissions.md#project-settings-belong-to-the-project-owner) of the project, access group `99` included, is refused with `INVALID_REQUEST` and `Only the project owner can change project settings.`
:::

When you click the delete project button, you will be asked to confirm the deletion of your project.

:::danger
When you delete your project, all the data related to your project will be deleted permanently, and cannot be recovered.
:::