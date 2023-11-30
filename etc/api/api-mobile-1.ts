export type API_MOBILE_1 = {
	post:{
		get: (args: { id: number; })=>Promise<{ post: { id: number; title: string | null; authorId: number | null; body: string | null; } | undefined; author: { id: number; name: string | null; email: string | null; password: string | null; postId: number | null; bossId: number | null; } | undefined; }>
	}
	user:{
		doesExist: (args: { email: string; })=>Promise<boolean>
		upload: (args: { id: number; b: { a: string; b?: number | undefined; c: string[]; d: { name: string | undefined; }[]; }; }, files: {file?: any[], avatar?: any[]})=>Promise<void>
		create: (args: { name: string | null; email: string; password: string; verificationCode: string; })=>Promise<number | undefined>
		createVerification: (args: { email: string; })=>Promise<boolean>
		login: (args: { name: string; password: string; })=>Promise<string | undefined>
	}
}

export function apiMobile1Factory(cmd:string, fetcher:(args?:any, files?: any)=>Promise<any>):API_MOBILE_1{
	 return {
		post:{
			get: (args:any)=>fetcher('post.get', args),
		},
		user:{
			doesExist: (args:any)=>fetcher('user.doesExist', args),
			upload: (args:any, files?: Record<string, string[]>)=>fetcher('user.upload', args, files),
			create: (args:any)=>fetcher('user.create', args),
			createVerification: (args:any)=>fetcher('user.createVerification', args),
			login: (args:any)=>fetcher('user.login', args),
		},
	}
}
