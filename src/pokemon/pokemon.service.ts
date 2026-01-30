import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  //Crear pokemon en base de datos.1
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()

    try {
      //Crear pokemon en base de datos.2
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;

    } catch (error) {
      //Manejo de errores
      if (error.code === 11000) {
        throw new BadRequestException(`Pokemon existe en la db ${JSON.stringify(error.keyValue)}`)
      }
      throw new InternalServerErrorException(`No se pudo crear el pokemon - Revisa los logs del servidor`)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    //Buscar por el no
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: Number(term) })
    }

    //Buscar por el mongoID
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term)
    }

    //Buscar por nombre
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }

    //No se encontro ningun pokemon.
    if (!pokemon) throw new NotFoundException(`Pokemon ${term} no encontrado`)
    return pokemon
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    //Buscando el pokemon
    const pokemon = await this.findOne(term);
    //Pasar a minuscula.
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    //grabar en base de datos.
    await pokemon.updateOne(updatePokemonDto);

    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  remove(id: string) {
    return `This action removes a #${id} pokemon`;
  }
}
