import { Injectable } from '@angular/core'
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { environment } from '../src/enviroment/enviroment'

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public supabase: SupabaseClient
  _session: AuthSession | null = null

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  usuarios(){
    return this.supabase
     .from('personas')
     .select(`*`)
  }

  async insertarData(nombre:any,cantidad:any, asiste:boolean = true){
    const { data, error } = await this.supabase
      .from('personas')
      .insert([
        { nombre_USUA: nombre, cantidad_personas_USUA: cantidad, asiste_USUA: asiste },
      ])
      .select()

    return { data, error }
  }


  profile(user: User) {
    return this.supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single()
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({ email })
  }

  signOut() {
    return this.supabase.auth.signOut()
  }

  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    }

    return this.supabase.from('profiles').upsert(update)
  }

  downLoadImage(path: string) {
    return this.supabase.storage.from('avatars').download(path)
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from('avatars').upload(filePath, file)
  }

  async verificarUsuarioAutorizado(email: string): Promise<boolean> {
    try {
      // Verifica si el email está en la tabla 'usuarios_autorizados'
      const { data, error } = await this.supabase
        .from('usuarios_autorizados')
        .select('email')
        .eq('email', email)
        .single()

      if (error) {
        console.error('Error verificando usuario:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error en verificación:', error)
      return false
    }
  }
}