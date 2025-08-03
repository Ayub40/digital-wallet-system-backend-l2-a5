import bcryptjs from "bcryptjs";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { Wallet } from "../modules/wallet/wallet.model";
import { Types } from "mongoose";


export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL })

        if (isSuperAdminExist) {
            console.log("Super Admin Already Exists!");
            return;
        }

        console.log("Trying to create Super Admin...");

        const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL
        }

        const userId = new Types.ObjectId();

        // 💰 Create wallet for super admin
        const wallet = await Wallet.create({
            user: userId,
            balance: 50,
        });

        const payload: IUser = {
            _id: userId,
            name: "Super admin",
            role: Role.SUPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            isVerified: true,
            auths: [authProvider],
            wallet: wallet._id,
            isApproved: true
        }

        const superadmin = await User.create(payload)
        console.log("Super Admin Created Successfuly! \n");
        console.log(superadmin);

    } catch (error) {
        console.log(error);
    }
}