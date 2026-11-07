import admin from './firebaseAdmin';

async function getUsers() {
    try {
        const listUsersResult = await admin.auth().listUsers(10);
        console.log('Firebase Users:');
        listUsersResult.users.forEach((userRecord) => {
            console.log(`User: ${userRecord.email} - UID: ${userRecord.uid}`);
        });

        // Let's reset or change password for the first user to simplify testing
        if (listUsersResult.users.length > 0) {
            const userEmail = listUsersResult.users[0].email;
            const uid = listUsersResult.users[0].uid;
            await admin.auth().updateUser(uid, {
                password: 'password123'
            });
            console.log(`\nSuccessfully reset password for ${userEmail} to: password123`);
        } else {
            console.log('No users found in Firebase. Creating admin@kkcakes.com...');
            await admin.auth().createUser({
                email: 'admin@kkcakes.com',
                password: 'password123'
            });
            console.log('Created user: admin@kkcakes.com with password: password123');
        }

    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

getUsers();
