import bcrypt

# --- Criando o hash da senha ---

# Senha em texto plano (deve ser codificada para bytes)
senha_original = b"password"

# Gera um "salt" e cria o hash da senha
hash_da_senha = bcrypt.hashpw(senha_original, bcrypt.gensalt())

# Armazene hash_da_senha (que é um valor em bytes) no seu banco de dados
print(hash_da_senha)

# --- Verificando a senha ---

# Senha enviada pelo usuário no login (codificada para bytes)
senha_do_login = b"password"

# Hash recuperado do banco de dados (também em bytes)
hash_do_banco_de_dados = b'$2b$12$1XCXpgmbzURJvo.bA5m58OSE4qhe6pukgSRMrxI9aNSlePy06FuTi' # Exemplo de hash

# Verifica a senha
if bcrypt.checkpw(senha_do_login, hash_do_banco_de_dados):
    print("A senha está correta!")
else:
    print("Senha incorreta.")
