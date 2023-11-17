import {UserRepository} from "../repositories/user-repository";
import {PostRepository} from "../repositories/post-repository";
import * as schema from "./schema";
import {VerificationRepository} from "../repositories/verification-repository";
import {repositoryFactory} from "../services/repository-factory";


const repository = {
	user: repositoryFactory(UserRepository, schema.user),
	post: repositoryFactory(PostRepository, schema.post),
	verification: repositoryFactory(VerificationRepository, schema.verification)
};

export default repository;
