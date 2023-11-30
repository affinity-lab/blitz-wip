export type API_MOBILE_2 = {
	post:{
		get: (args: { id: number; })=>Promise<{ post: { id: number; title: string | null; authorId: number | null; body: string | null; } | undefined; author: { id: number; name: string | null; email: string | null; password: string | null; postId: number | null; bossId: number | null; } | undefined; }>
	}
	user:{
		all: (args: )=>Promise<boolean>
		doesExists: (args: { id: number | null; })=>Promise<{ id: number; name: string | null; email: string | null; password: string | null; postId: number | null; bossId: number | null; } | undefined>
		create: (args: { name: string | null; email: string; password: string; verificationCode: string; })=>Promise<number | undefined>
	}
}

export function apiMobile2Factory(cmd:string, fetcher:(args?:any, files?: any)=>Promise<any>):API_MOBILE_2{
	 return {
		post:{
			get: (args:any)=>fetcher('post.get', args),
		},
		user:{
			all: (args:any)=>fetcher('user.all', args),
			doesExists: (args:any)=>fetcher('user.doesExists', args),
			create: (args:any)=>fetcher('user.create', args),
		},
	}
}
