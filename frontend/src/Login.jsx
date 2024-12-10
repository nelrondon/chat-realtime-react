import "./Login.css"

export function Login({username, setUsername}){
    const handleSubmit = (e)=>{
        e.preventDefault();
        const user = e.target.user.value;
        if(user){
            localStorage.setItem("username", user);
            setUsername(user)
        }
    }

    return(
        <form id="login" onSubmit={handleSubmit}>
            <h2>¡Bienvenido!</h2>
            <h1>Ingresa tu nombre para registrarte</h1>
            <input type="text" name="user" placeholder="Tu nombre aquí"/>
            <button type="submit">Registrar</button>
        </form>
    )
}

